const cloudinary = require('../../middleware/cloudinary.config');
const path = require('path');
const ExpressError = require('../../utils/ExpressError');
const fs = require('node:fs');
const questionsModel = require("../../models/questions.model");
const { summarizeSpokenTextSchemaValidator, addMultipleChoiceAndMultipleAnswersSchemaValidator, addListeningFillInTheBlanksSchemaValidator, addMultipleChoiceSingleAnswerSchemaValidator, editSummarizeSpokenTextSchemaValidator, EditAddMultipleChoiceAndMultipleAnswersSchemaValidator, EditListeningFillInTheBlanksSchemaValidator, EditMultipleChoiceSingleAnswerSchemaValidator } = require('../../validations/schemaValidations');
const { asyncWrapper } = require("../../utils/AsyncWrapper");
const https = require('https');
const axios = require('axios');
const { OpenAI } = require('openai');
const practicedModel = require('../../models/practiced.model');
const { getQuestionByQuery } = require('../../common/getQuestionFunction');
const {
    buildObjectiveAssessment,
    buildSummarizeSpokenTextAssessment,
} = require('../../common/questionAssessment');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function extractJsonObject(content) {
    if (typeof content !== 'string') {
        throw new Error('Invalid model response format');
    }

    const trimmedContent = content.trim();
    const fencedMatch = trimmedContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = fencedMatch ? fencedMatch[1].trim() : trimmedContent;
    const objectStart = candidate.indexOf('{');
    const objectEnd = candidate.lastIndexOf('}');

    if (objectStart === -1 || objectEnd === -1 || objectEnd < objectStart) {
        throw new Error('Model response did not contain a JSON object');
    }

    return JSON.parse(candidate.slice(objectStart, objectEnd + 1));
}

function normalizeBlankAnswerValues(answer) {
    if (Array.isArray(answer)) {
        return answer.reduce((result, item, index) => {
            if (item && typeof item === 'object' && !Array.isArray(item)) {
                const normalizedIndex = Number(item.index);
                if (Number.isFinite(normalizedIndex)) {
                    result[normalizedIndex] = typeof item.selectedAnswer === 'string'
                        ? item.selectedAnswer
                        : '';
                }
                return result;
            }

            result[index] = typeof item === 'string' ? item : '';
            return result;
        }, []);
    }

    if (answer && typeof answer === 'object') {
        return Object.entries(answer).reduce((result, [index, value]) => {
            const normalizedIndex = Number(index);
            if (Number.isFinite(normalizedIndex)) {
                result[normalizedIndex] = typeof value === 'string' ? value : '';
            }
            return result;
        }, []);
    }

    if (typeof answer === 'string' && answer.trim()) {
        return [answer];
    }

    return [];
}

function normalizeSingleChoiceAnswer(answer) {
    if (Array.isArray(answer)) {
        return answer.filter((item) => typeof item === 'string' && item.trim());
    }

    if (typeof answer === 'string' && answer.trim()) {
        return [answer];
    }

    if (
        answer &&
        typeof answer === 'object' &&
        typeof answer.value === 'string' &&
        answer.value.trim()
    ) {
        return [answer.value];
    }

    return [];
}
// helper functions

const countWords = (text = "") =>
    String(text)
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;

const enforceSummarizeSpokenTextScore = (assessment = {}, userSummary = "") => {
    const scores = {
        content: Number(assessment?.scores?.content) || 0,
        form: Number(assessment?.scores?.form) || 0,
        grammar: Number(assessment?.scores?.grammar) || 0,
        spelling: Number(assessment?.scores?.spelling) || 0,
        vocabulary_range: Number(assessment?.scores?.vocabulary_range) || 0,
    };

    const wordCount = countWords(userSummary);

    if (wordCount < 20 || wordCount > 30) {
        scores.form = 0;
    }

    return {
        ...assessment,
        scores,
        word_count: wordCount,
        total_score: scores.content === 0 || scores.form === 0
            ? 0
            : scores.content + scores.form + scores.grammar + scores.spelling + scores.vocabulary_range,
    };
};

const scoreWithChatGPT = async (originalTranscript, userSummary) => {
    try {
        const prompt = `
You are an expert assessor for the PTE Core Summarize Spoken Text task.

ORIGINAL TRANSCRIPT:
"${originalTranscript}"

USER SUMMARY:
"${userSummary}"

Apply these scoring rules:
- The summary should stay within 20-30 words.
- Score out of 10.
- Use these five traits only, each scored 0-2:
  1. Content
  2. Form
  3. Grammar
  4. Spelling
  5. Vocabulary Range
- If Content = 0 or Form = 0, total_score must be 0.

Return valid JSON only in this exact shape:
{
  "scores": {
    "content": 0,
    "form": 0,
    "grammar": 0,
    "spelling": 0,
    "vocabulary_range": 0
  },
  "total_score": 0,
  "word_count": 0,
  "feedback": {
    "strengths": "",
    "improvements": "",
    "overall": ""
  }
}
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an expert assessor for PTE Core summarize spoken text responses. Reply with valid JSON only." },
                { role: "user", content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 500
        });

        return enforceSummarizeSpokenTextScore(
            extractJsonObject(response.choices[0].message.content),
            userSummary
        );
    } catch (error) {
        console.error('Error calling ChatGPT:', error);
        throw new Error('Failed to get ChatGPT assessment: ' + error.message);
    }
};

// --------------------------summarization spoken text-------------------------
module.exports.addSummarizeSpokenText = asyncWrapper(async (req, res) => {

    const newData = req.body;

    if (!newData) {
        throw new ExpressError(400, "New data is required");
    }

    if (newData.type != 'listening' || newData.subtype != 'summarize_spoken_text') {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }


    if (req.file === undefined) throw new ExpressError(400, 'Please upload a file');

    const { error, value } = summarizeSpokenTextSchemaValidator.validate(newData);

    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }

    const { type = 'listening', subtype = 'summarize_spoken_text', heading } = value;

    const folderName = 'summarizeSpokenText';

    const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
        public_id: `${path.basename(req.file.originalname, path.extname(req.file.originalname))}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        folder: `listening_test/${folderName}`,
        type: 'upload',
    })

    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(req.file.path),
        model: 'whisper-1',
        response_format: 'text',
    });
    const ConvertedText = transcription;

    fs.unlinkSync(req.file.path);

    const data = {
        type,
        subtype,
        heading,
        audioUrl: result.secure_url,
        audioConvertedText: ConvertedText,
        createdBy: req.user._id
    };

    const newQuestion = await questionsModel.create(data)

    res.status(200).json(newQuestion);
})

module.exports.editSummarizeSpokenText = asyncWrapper(async (req, res) => {
    const newData = req.body;

    if (!newData) {
        throw new ExpressError(400, "New data is required");
    }

    if ((newData.type && newData.type != 'listening') || (newData.subtype && newData.subtype != 'summarize_spoken_text')) {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    const { questionId, ...data } = newData;

    if (!questionId) throw new ExpressError(400, "Question ID is required");

    // Validate incoming data (excluding questionId)
    const { error, value } = editSummarizeSpokenTextSchemaValidator.validate(data);
    if (error) throw new ExpressError(400, error.details[0].message);

    if (req.file !== undefined) {
        const folderName = 'summarizeSpokenText';

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            public_id: `${path.basename(req.file.originalname, path.extname(req.file.originalname))}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            folder: `listening_test/${folderName}`,
           type: 'upload',
        });

        // Get transcription from Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(req.file.path),
            model: 'whisper-1',
            response_format: 'text',
        });

        fs.unlinkSync(req.file.path); // Clean up temp file

        value.audioUrl = result.secure_url;
        value.audioConvertedText = transcription; // Update audioConvertedText field
    }

    const question = await questionsModel.findByIdAndUpdate(questionId, value, { new: true });
    if (!question) throw new ExpressError(404, 'Question not found');

    res.status(200).json({
        message: "Question updated successfully",
        question: question,
    });
});

module.exports.getAllSummarizeSpokenText = asyncWrapper(async (req, res) => {
    let query = req.query.query;
    if (!query) query = 'all';
    const { page, limit } = req.query;

    getQuestionByQuery(query, 'summarize_spoken_text', page, limit, req, res);
});



module.exports.summerizeSpokenTextResult = asyncWrapper(async (req, res) => {
    const { questionId, answer } = req.body;
    

    if (!questionId || !answer) {
        return res.status(400).json({ message: 'questionId and answer are required.' });
    }

    try {
        const question = await questionsModel.findById(questionId);
        if (!question) {
            throw new ExpressError(404, 'Question not found!');
        }

        if (question.subtype !== 'summarize_spoken_text') {
            throw new ExpressError(401, "this is not valid questionType for this route!")
        }

        const originalTranscript = question.audioConvertedText;;
        if (!originalTranscript) {
            throw new Error('Could not extract transcript from API response');
        }

        const chatGPTAssessment = await scoreWithChatGPT(originalTranscript, answer);

        const finalResult = {

            original_transcript: originalTranscript,
            user_summary: answer,

            summarize_text_score: chatGPTAssessment,

            summary: {
                // pronunciation_score: apiResponse.data.pronunciation?.overall_score || 0,
                // fluency_score: apiResponse.data.fluency?.overall_score || 0,
                // grammar_score: apiResponse.data.grammar?.overall_score || 0,
                // vocabulary_score: apiResponse.data.vocabulary?.overall_score || 0,
                // overall_language_score: apiResponse.data.overall?.overall_score || 0,
                summary_quality_score: chatGPTAssessment.total_score,
                combined_assessment: {
                    summary_writing_ability: `${chatGPTAssessment.total_score}/10`
                }
            }
        };

        await practicedModel.findOneAndUpdate(
            {
                user: req.user._id,
                questionType: question.type,
                subtype: question.subtype
            },
            {
                $addToSet: { practicedQuestions: question._id }
            },
            { upsert: true, new: true }
        );


        return res.status(200).json({
            ...finalResult,
            assessment: buildSummarizeSpokenTextAssessment(finalResult),
        });

    } catch (error) {
        console.error('Error during audio processing:', error);

        if (error.response) {
            console.error('API Response Status:', error.response.status);
            console.error('API Response Data:', error.response.data);

            return res.status(error.response.status).json({
                message: 'API request failed',
                details: error.response.data,
                status: error.response.status
            });
        } else {
            return res.status(500).json({
                message: 'Error processing request',
                details: error.message
            });
        }
    }
});
// --------------------------multiple choice and multiple answers---------------

module.exports.addMultipleChoicesAndMultipleAnswers = asyncWrapper(async (req, res) => {

    if (req.file === undefined) throw new ExpressError(400, 'Please upload a file');

    if (req.body.type != 'listening' || req.body.subtype != 'listening_multiple_choice_multiple_answers') {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    if (typeof req.body.options === 'string' || typeof req.body.correctAnswers === 'string') {
        req.body.options = JSON.parse(req.body.options);
        req.body.correctAnswers = JSON.parse(req.body.correctAnswers);
    }
    const { error, value } = addMultipleChoiceAndMultipleAnswersSchemaValidator.validate(req.body);

    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }

    const { type = 'listening', subtype = 'listening_multiple_choice_multiple_answers', heading, prompt, options, correctAnswers } = value;

    const folderName = 'multiplechoicesmultipleanswers';

    const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
        public_id: `${path.basename(req.file.originalname, path.extname(req.file.originalname))}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        folder: `listening_test/${folderName}`,
        type: 'upload',
    })

    fs.unlinkSync(req.file.path);

    const data = {
        type,
        subtype,
        heading,
        prompt,
        options,
        correctAnswers,
        audioUrl: result.secure_url,
        createdBy: req.user._id
    };

    const newQuestion = await questionsModel.create(data)

    res.status(200).json(newQuestion);
})

module.exports.editMultipleChoicesAndMultipleAnswers = asyncWrapper(async (req, res) => {

    if ((req.body.type && req.body.type != 'listening') || (req.body.subtype && req.body.subtype != 'listening_multiple_choice_multiple_answers')) {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    if (typeof req.body.options === 'string' || typeof req.body.correctAnswers === 'string') {
        req.body.options = JSON.parse(req.body.options);
        req.body.correctAnswers = JSON.parse(req.body.correctAnswers);
    }
    const { questionId, ...data } = req.body;

    const { error, value } = EditAddMultipleChoiceAndMultipleAnswersSchemaValidator.validate(data);
    if (error) throw new ExpressError(400, error.details[0].message);

    if (!questionId) throw new ExpressError(400, "Question ID is required");

    if (req.file !== undefined) {
        const folderName = 'multiplechoicesmultipleanswers';
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            public_id: `${path.basename(req.file.originalname, path.extname(req.file.originalname))}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            folder: `listening_test/${folderName}`,
           type: 'upload',
        })

        fs.unlinkSync(req.file.path);
        value.audioUrl = result.secure_url;
    }
    const question = await questionsModel.findByIdAndUpdate(questionId, value, { new: true });
    if (!question) throw new ExpressError(404, 'Question not found');


    res.status(200).json({
        message: "Question updated successfully",
        question: question,
    });
})

module.exports.getAllMultipleChoicesAndMultipleAnswers = asyncWrapper(async (req, res) => {
    let query = req.query.query;
    if (!query) query = 'all';
    const { page, limit } = req.query;

    getQuestionByQuery(query, 'listening_multiple_choice_multiple_answers', page, limit, req, res);
});

module.exports.multipleChoicesAndMultipleAnswersResult = asyncWrapper(async (req, res) => {
    const { questionId, answer } = req.body;

    const question = await questionsModel.findById(questionId);
    if (!question) {
        throw new ExpressError(404, "Question Not Found!");
    }
    if (question.subtype !== 'listening_multiple_choice_multiple_answers') {
        throw new ExpressError(401, "this is not valid questionType for this route!")
    }

    const correctAnswers = question.correctAnswers;
    let score = 0;

    answer.forEach((userAnswer) => {
        if (correctAnswers.includes(userAnswer)) {
            score++;
        }
    });

    const result = {
        score,
        totalCorrectAnswers: correctAnswers.length,
        correctAnswersGiven: score === correctAnswers.length,
    };

    const feedback = `You scored ${score} out of ${correctAnswers.length}.`;

    await practicedModel.findOneAndUpdate(
        {
            user: req.user._id,
            questionType: question.type,
            subtype: question.subtype
        },
        {
            $addToSet: { practicedQuestions: question._id }
        },
        { upsert: true, new: true }
    );

    return res.status(200).json({
        result,
        feedback,
        assessment: buildObjectiveAssessment({
            questionType: question.type,
            subtype: question.subtype,
            title: question.heading,
            score: result.score,
            maxScore: result.totalCorrectAnswers,
            feedback,
            meta: {
                correctAnswersGiven: result.correctAnswersGiven,
                totalCorrectAnswers: result.totalCorrectAnswers,
            },
        }),
    });
})

// --------------------------listening fill in the blanks-----------------
module.exports.addListeningFillInTheBlanks = asyncWrapper(async (req, res) => {
    if (req.file === undefined) throw new ExpressError(400, 'Please upload a file');

    if (req.body.type != 'listening' || req.body.subtype != 'listening_fill_in_the_blanks') {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    if (typeof req.body.blanks === 'string') {
        req.body.blanks = JSON.parse(req.body.blanks);
    }

    const { error, value } = addListeningFillInTheBlanksSchemaValidator.validate(req.body);
    if (error) throw new ExpressError(400, error.details[0].message);

    const { type = 'listening', subtype = 'listening_fill_in_the_blanks', heading, prompt, blanks } = value;

    const folderName = 'listeningfillintheblanks';

    const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
        public_id: `${path.basename(req.file.originalname, path.extname(req.file.originalname))}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        folder: `listening_test/${folderName}`,
        type: 'upload',
    });

    fs.unlinkSync(req.file.path);

    const data = {
        type,
        subtype,
        heading,
        prompt,
        blanks,
        audioUrl: result.secure_url,
        createdBy: req.user._id
    };

    const newQuestion = await questionsModel.create(data);

    res.status(200).json(newQuestion);
});

module.exports.editListeningFillInTheBlanks = asyncWrapper(async (req, res) => {
    if ((req.body.type && req.body.type != 'listening') || (req.body.subtype && req.body.subtype != 'listening_fill_in_the_blanks')) {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    if (typeof req.body.blanks === 'string') {
        req.body.blanks = JSON.parse(req.body.blanks);
    }
    const { questionId, ...data } = req.body;

    const { error, value } = EditListeningFillInTheBlanksSchemaValidator.validate(data);
    if (error) throw new ExpressError(400, error.details[0].message);

    if (!questionId) throw new ExpressError(400, "Question ID is required");

    if (req.file !== undefined) {
        const folderName = 'listeningfillintheblanks';
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            public_id: `${path.basename(req.file.originalname, path.extname(req.file.originalname))}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            folder: `listening_test/${folderName}`,
            type: 'upload',
        })

        fs.unlinkSync(req.file.path);
        value.audioUrl = result.secure_url;
    }
    const question = await questionsModel.findByIdAndUpdate(questionId, value, { new: true });
    if (!question) throw new ExpressError(404, 'Question not found');


    res.status(200).json({
        message: "Question updated successfully",
        question: question,
    });
})

module.exports.getAllListeningFillInTheBlanks = asyncWrapper(async (req, res) => {
    let query = req.query.query;
    if (!query) query = 'all';
    const { page, limit } = req.query;

    getQuestionByQuery(query, 'listening_fill_in_the_blanks', page, limit, req, res);
});


module.exports.listeningFillInTheBlanksResult = asyncWrapper(async (req, res) => {
    const { questionId, answer } = req.body;

    const question = await questionsModel.findById(questionId);
    if (!question) {
        throw new ExpressError(404, "Question Not Found!");
    }

    if (question.subtype !== 'listening_fill_in_the_blanks') {
        throw new ExpressError(401, "This is not a valid questionType for this route!");
    }

    const blanks = question.blanks;
    const normalizedAnswers = normalizeBlankAnswerValues(answer);

    let score = 0;

    normalizedAnswers.forEach((userAnswer, index) => {
        const correctAnswer = blanks[index]?.correctAnswer;

        if (correctAnswer && correctAnswer === userAnswer) {
            score++;
        }
    });

    const result = {
        score,
        totalCorrectAnswers: blanks.length,
        correctAnswersGiven: score === blanks.length,
    };

    const feedback = `You scored ${score} out of ${blanks.length}.`;

    await practicedModel.findOneAndUpdate(
        {
            user: req.user._id,
            questionType: question.type,
            subtype: question.subtype
        },
        {
            $addToSet: { practicedQuestions: question._id }
        },
        { upsert: true, new: true }
    );


    return res.status(200).json({
        result,
        feedback,
        assessment: buildObjectiveAssessment({
            questionType: question.type,
            subtype: question.subtype,
            title: question.heading,
            score: result.score,
            maxScore: result.totalCorrectAnswers,
            feedback,
            meta: {
                correctAnswersGiven: result.correctAnswersGiven,
                totalCorrectAnswers: result.totalCorrectAnswers,
            },
        }),
    });
});


// --------------------------multiple choice single answers-----------------
module.exports.addMultipleChoiceSingleAnswers = asyncWrapper(async (req, res) => {
    if (req.file === undefined) throw new ExpressError(400, 'Please upload a file');

    // Add type/subtype validation
    if (req.body.type != 'listening' || req.body.subtype != 'listening_multiple_choice_single_answers') {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    if (typeof req.body.options === 'string' || typeof req.body.correctAnswers === 'string') {
        req.body.options = JSON.parse(req.body.options);
        req.body.correctAnswers = JSON.parse(req.body.correctAnswers);
    }
    const { error, value } = addMultipleChoiceSingleAnswerSchemaValidator.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }
    const { type = 'listening', subtype = 'listening_multiple_choice_single_answers', heading, prompt, options, correctAnswers } = value;

    const folderName = 'multiplechoicesingleanswers';

    const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
        public_id: `${path.basename(req.file.originalname, path.extname(req.file.originalname))}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        folder: `listening_test/${folderName}`,
        type: 'upload',
    })

    fs.unlinkSync(req.file.path);

    const data = {
        type,
        subtype,
        heading,
        prompt,
        options,
        correctAnswers,
        audioUrl: result.secure_url,
        createdBy: req.user._id
    };

    const newQuestion = await questionsModel.create(data)

    res.status(200).json(newQuestion);
})


module.exports.editMultipleChoiceSingleAnswers = asyncWrapper(async (req, res) => {
    if ((req.body.type && req.body.type != 'listening') || (req.body.subtype && req.body.subtype != 'listening_multiple_choice_single_answers')) {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    // Parse the options and correctAnswers if they are passed as strings
    if (typeof req.body.options === 'string' || typeof req.body.correctAnswers === 'string') {
        req.body.options = JSON.parse(req.body.options);
        req.body.correctAnswers = JSON.parse(req.body.correctAnswers);
    }

    const { questionId, ...data } = req.body;

    // Validate the data using the schema validator
    const { error, value } = EditMultipleChoiceSingleAnswerSchemaValidator.validate(data);
    if (error) throw new ExpressError(400, error.details[0].message);

    if (!questionId) throw new ExpressError(400, "Question ID is required");

    // Handle file upload (optional)
    if (req.file !== undefined) {
        const folderName = 'multiplechoicesingleanswers';
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            public_id: `${path.basename(req.file.originalname, path.extname(req.file.originalname))}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            folder: `listening_test/${folderName}`,
            type: 'upload',
        });

        fs.unlinkSync(req.file.path);
        value.audioUrl = result.secure_url;
    }

    // Explicitly retain the 'heading' field in the update
    value.type = 'listening';
    value.subtype = 'listening_multiple_choice_single_answers';

    // Retrieve the question and update it
    const question = await questionsModel.findByIdAndUpdate(questionId, { $set: value }, { new: true });
    if (!question) throw new ExpressError(404, 'Question not found');

    // Respond with the updated question
    res.status(200).json({
        message: "Question updated successfully",
        updatedQuestion: question,
    });
});

module.exports.getAllMultipleChoiceSingleAnswers = asyncWrapper(async (req, res) => {
    let query = req.query.query;
    if (!query) query = 'all';
    const { page, limit } = req.query;

    getQuestionByQuery(query, 'listening_multiple_choice_single_answers', page, limit, req, res);
});


module.exports.multipleChoiceSingleAnswerResult = asyncWrapper(async (req, res) => {
    const { questionId, answer } = req.body;
    const normalizedAnswers = normalizeSingleChoiceAnswer(answer);


    if (normalizedAnswers.length > 1) {
        throw new ExpressError(401, "multiple answer is not allowed!");
    }


    const question = await questionsModel.findById(questionId);
    if (!question) {
        throw new ExpressError(404, "Question Not Found!");
    }
    if (question.subtype !== 'listening_multiple_choice_single_answers') {
        throw new ExpressError(401, "this is not valid questionType for this route!")
    }

    const correctAnswers = question.correctAnswers;
    let score = 0;

    normalizedAnswers.forEach((userAnswer) => {
        if (correctAnswers.includes(userAnswer)) {
            score++;
        }
    });

    const result = {
        score,
        totalCorrectAnswers: correctAnswers.length,
        correctAnswersGiven: score === correctAnswers.length,
    };

    const feedback = `You scored ${score} out of ${correctAnswers.length}.`;

    await practicedModel.findOneAndUpdate(
        {
            user: req.user._id,
            questionType: question.type,
            subtype: question.subtype
        },
        {
            $addToSet: { practicedQuestions: question._id }
        },
        { upsert: true, new: true }
    );

    return res.status(200).json({
        result,
        feedback,
        assessment: buildObjectiveAssessment({
            questionType: question.type,
            subtype: question.subtype,
            title: question.heading,
            score: result.score,
            maxScore: result.totalCorrectAnswers,
            feedback,
            meta: {
                correctAnswersGiven: result.correctAnswersGiven,
                totalCorrectAnswers: result.totalCorrectAnswers,
            },
        }),
    });
})
