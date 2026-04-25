const questionsModel = require("../../models/questions.model");
const ExpressError = require("../../utils/ExpressError");
const {
    readAloudSchemaValidator,
    repeatSentenceSchemaValidator,
    respondToASituationSchemaValidator,
    answerShortQuestionSchemaValidator,
    editreadAloudSchemaValidator,
    editrepeatSentenceSchemaValidator,
    editrespondToASituationSchemaValidator,
    editanswerShortQuestionSchemaValidator
} = require("../../validations/schemaValidations");
const cloudinary = require('../../middleware/cloudinary.config');
const path = require('path');
const fs = require('node:fs');
const { asyncWrapper } = require("../../utils/AsyncWrapper");
const fsPromises = require('fs').promises;
const { OpenAI } = require('openai');
const practicedModel = require("../../models/practiced.model");
const { getQuestionByQuery } = require("../../common/getQuestionFunction");
const {
    buildAnswerShortQuestionAssessment,
    buildRepeatSentenceAssessment,
} = require("../../common/questionAssessment");
const { speakingReadAloudResult, speakingevaluateRepeatSentenceResult, speakingrespondToASituationResult } = require("../mockTestControllers/questionResultHelper/fullMockTest.result.controller");


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
// ============================================================
// HELPER FUNCTIONS
// ============================================================

// File operations
async function safeDeleteFile(filePath) {
    if (filePath) {
        try {
            await fsPromises.unlink(filePath);
        } catch (err) {
            console.error("Failed to delete temp file:", err);
        }
    }
}

function clampScore(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function extractJsonObject(content) {
    if (typeof content !== 'string') {
        throw new ExpressError(500, 'Invalid model response format');
    }

    const trimmedContent = content.trim();
    const fencedMatch = trimmedContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = fencedMatch ? fencedMatch[1].trim() : trimmedContent;
    const objectStart = candidate.indexOf('{');
    const objectEnd = candidate.lastIndexOf('}');

    if (objectStart === -1 || objectEnd === -1 || objectEnd < objectStart) {
        throw new ExpressError(500, 'Model response did not contain a JSON object');
    }

    return JSON.parse(candidate.slice(objectStart, objectEnd + 1));
}

function normalizeUnitScore(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return 0;
    }

    return clampScore(numericValue, 0, 1);
}

function normalizeYesNo(value) {
    return String(value || '').trim().toUpperCase() === 'YES' ? 'YES' : 'NO';
}

function normalizeComparableText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getAcceptedAnswerVariants(correctText) {
    const raw = String(correctText || "").trim();
    if (!raw) return [];

    const variants = raw
        .split(/\r?\n|\|/)
        .map((item) => item.trim())
        .filter(Boolean);

    return variants.length ? variants : [raw];
}

function buildDeterministicAnswerShortQuestionResult({ userText = "", correctText = "" } = {}) {
    const normalizedUserText = normalizeComparableText(userText);
    const acceptedAnswers = getAcceptedAnswerVariants(correctText);
    const normalizedAcceptedAnswers = acceptedAnswers
        .map((answer) => normalizeComparableText(answer))
        .filter(Boolean);

    const isCorrect =
        Boolean(normalizedUserText) &&
        normalizedAcceptedAnswers.some((answer) => answer === normalizedUserText);

    const score = isCorrect ? 1 : 0;

    return {
        result: {
            Speaking: score,
            Listening: score,
            EnablingSkills: isCorrect ? "YES" : "NO",
            Fluency: score,
            Pronunciation: score,
        },
        data: {
            speakingScore: score,
            listeningScore: score,
            fluency: score,
            pronunciation: score,
            enablingSkills: isCorrect ? "YES" : "NO",
            predictedText: userText,
            correctText,
            matchedExpectedAnswer: isCorrect,
        },
    };
}

function normalizeAnswerShortQuestionScores(rawResult = {}) {
    const normalizedResult = {
        Speaking: normalizeUnitScore(rawResult.Speaking ?? rawResult.speaking),
        Listening: normalizeUnitScore(rawResult.Listening ?? rawResult.listening),
        EnablingSkills: normalizeYesNo(rawResult.EnablingSkills ?? rawResult.enablingSkills),
        Fluency: normalizeUnitScore(rawResult.Fluency ?? rawResult.fluency),
        Pronunciation: normalizeUnitScore(rawResult.Pronunciation ?? rawResult.pronunciation),
    };

    return {
        result: normalizedResult,
        data: {
            speakingScore: normalizedResult.Speaking,
            listeningScore: normalizedResult.Listening,
            fluency: normalizedResult.Fluency,
            pronunciation: normalizedResult.Pronunciation,
            enablingSkills: normalizedResult.EnablingSkills,
            predictedText: rawResult.predictedText || "",
            correctText: rawResult.correctText || "",
            matchedExpectedAnswer: Boolean(rawResult.matchedExpectedAnswer),
        },
    };
}

async function uploadToCloudinary(file, folderName) {
    if (!file) throw new ExpressError(400, 'Please upload a file');

    const result = await cloudinary.uploader.upload(file.path, {
        resource_type: 'auto',
        public_id: `${path.basename(file.originalname, path.extname(file.originalname))}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        folder: `listening_test/${folderName}`,
        type: 'authenticated',
    });

    fs.unlinkSync(file.path);
    return result.secure_url;
}

async function addQuestion(validator, data, userId, audioFile = null, folderName = null, convertToText = false) {
    const { error, value } = validator.validate(data);
    if (error) throw new ExpressError(400, error.details[0].message);

    let questionData = {
        ...value,
        createdBy: userId,
    };

    if (audioFile && convertToText === true) {
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioFile.path),
            model: 'whisper-1',
            response_format: 'text',
        });
        const ConvertedText = transcription;
        questionData.audioConvertedText = ConvertedText;
    }
    if (audioFile && folderName) {
        questionData.audioUrl = await uploadToCloudinary(audioFile, folderName);
    }

    const newQuestion = await questionsModel.create(questionData);
    return newQuestion;
}

async function editQuestion(validator, questionId, data, userId, audioFile = null, folderName = null, convertToText = false) {
    const { error, value } = validator.validate(data);
    if (error) throw new ExpressError(400, error.details[0].message);

    if (!questionId) throw new ExpressError(400, "Question ID is required");

    if (audioFile && folderName && convertToText) {
        // Get transcription using Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioFile.path),
            model: 'whisper-1',
            response_format: 'text',
        });

        value.audioConvertedText = transcription;
    }
    if (audioFile && folderName) {
        // Upload to Cloudinary
        const audioUrl = await uploadToCloudinary(audioFile, folderName);
        value.audioUrl = audioUrl;
    }

    // Update the DB
    const question = await questionsModel.findByIdAndUpdate(
        questionId,
        { ...value, createdBy: userId },
        { new: true }
    );

    if (!question) throw new ExpressError(404, 'Question not found');

    return question;
}

// ============================================================
// READ ALOUD FUNCTIONS
// ============================================================

module.exports.addReadAloud = asyncWrapper(async (req, res) => {

    const newData = req.body;

    if (!newData) {
        throw new ExpressError(400, "New data is required");
    }

    if (newData.type != 'speaking' || newData.subtype != 'read_aloud') {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    const { type = 'speaking', subtype = 'read_aloud', heading, prompt } = newData;
    const newQuestion = await addQuestion(
        readAloudSchemaValidator,
        { type, subtype, heading, prompt },
        req.user._id
    );

    return res.status(200).json({
        message: "Question added successfully",
        question: newQuestion,
    });
});

module.exports.editReadAloud = asyncWrapper(async (req, res) => {
    const newData = req.body;

    if (!newData) {
        throw new ExpressError(400, "New data is required");
    }

    if ((newData.type && newData.type != 'speaking') || (newData.subtype && newData.subtype != 'read_aloud')) {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    const { questionId, ...data } = newData;
    const { type = 'speaking', subtype = 'read_aloud', heading, prompt } = data;

    const question = await editQuestion(
        editreadAloudSchemaValidator,
        questionId,
        { type, subtype, heading, prompt },
        req.user._id
    );

    return res.status(200).json({
        message: "Question updated successfully",
        question,
    });
});

module.exports.getAllReadAloud = asyncWrapper(async (req, res) => {
    let query = req.query.query;
    if (!query) query = 'all';
    const { page, limit } = req.query;

    getQuestionByQuery(query, 'read_aloud', page, limit, req, res);
});

module.exports.readAloudResult = asyncWrapper(async (req, res) => {
    await speakingReadAloudResult({ req, res });
});

// ============================================================
// REPEAT SENTENCE FUNCTIONS
// ============================================================

module.exports.addRepeatSentence = asyncWrapper(async (req, res) => {
    const newData = req.body;

    if (!newData) {
        throw new ExpressError(400, "New data is required");
    }

    if (newData.type != 'speaking' || newData.subtype != 'repeat_sentence') {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    const { type = 'speaking', subtype = 'repeat_sentence', heading } = newData;
    const newQuestion = await addQuestion(
        repeatSentenceSchemaValidator,
        { type, subtype, heading },
        req.user._id,
        req.file,
        'repeatSentence',
        true
    );

    return res.status(200).json({
        message: "Question added successfully",
        question: newQuestion,
    });
});

module.exports.editRepeatSentence = asyncWrapper(async (req, res) => {
    const newData = req.body;

    if (!newData) {
        throw new ExpressError(400, "New data is required");
    }

    if ((newData.type && newData.type != 'speaking') || (newData.subtype && newData.subtype != 'repeat_sentence')) {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    const { questionId, ...data } = newData;
    data.type = 'speaking';
    data.subtype = 'repeat_sentence';

    const question = await editQuestion(
        editrepeatSentenceSchemaValidator,
        questionId,
        data,
        req.user._id,
        req.file,
        'repeatSentence'
    );

    return res.status(200).json({
        message: "Question updated successfully",
        question,
    });
});

module.exports.getAllRepeatSentence = asyncWrapper(async (req, res) => {
    let query = req.query.query;
    if (!query) query = 'all';
    const { page, limit } = req.query;

    getQuestionByQuery(query, 'repeat_sentence', page, limit, req, res);
});


module.exports.repeatSentenceResult = asyncWrapper(async (req, res) => {
    const { questionId, accent = 'us' } = req.body;
    let userFilePath = req.file?.path;
    const userId = req.user._id;

    const result = await speakingevaluateRepeatSentenceResult({ userId, questionId, userFilePath, accent });
    const assessment = buildRepeatSentenceAssessment(result);

    return res.status(200).json({
        success: true,
        data: result,
        assessment,
        ...result,
    });
});
// module.exports.repeatSentenceResult = asyncWrapper(async (req, res) => {
//     const { questionId, accent = 'us' } = req.body;
//     let userFilePath = req.file?.path;

//     try {
//         if (!questionId) throw new ExpressError(400, "questionId is required!");
//         if (!req.file) throw new ExpressError(400, "voice is required!");

//         const question = await questionsModel.findById(questionId);
//         if (!question) throw new ExpressError(404, "Question Not Found!");

//         const userfileBase64 = readFileAsBase64(userFilePath);
//         const expectedText = question.audioConvertedText;
//         const finalFormat = detectAudioFormat(userFilePath);

//         const finalResponse = await callSpeechAssessmentAPI(
//             userfileBase64,
//             finalFormat,
//             expectedText,
//             accent
//         );

//         await safeDeleteFile(userFilePath);

//         await practicedModel.findOneAndUpdate(
//             {
//                 user: req.user._id,
//                 questionType: question.type,
//                 subtype: question.subtype
//             },
//             {
//                 $addToSet: { practicedQuestions: question._id }
//             },
//             { upsert: true, new: true }
//         );

//         return res.status(200).json({
//             success: true,
//             data: finalResponse
//         });

//     } catch (error) {
//         await safeDeleteFile(userFilePath);
//         throw error;
//     }
// });

// ============================================================
// RESPOND TO SITUATION FUNCTIONS
// ============================================================

module.exports.addRespondToASituation = asyncWrapper(async (req, res) => {
    if (!req.file) {
        throw new ExpressError(400, "File is Required");
    }
    const newData = req.body;

    if (!newData) {
        throw new ExpressError(400, "New data is required");
    }

    if (newData.type != 'speaking' || newData.subtype != 'respond_to_situation') {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    const { type = 'speaking', subtype = 'respond_to_situation', heading, prompt } = newData;
    const newQuestion = await addQuestion(
        respondToASituationSchemaValidator,
        { type, subtype, heading, prompt },
        req.user._id,
        req.file,
        'respondToASituation'
    );

    return res.status(200).json({
        message: "Question added successfully",
        question: newQuestion,
    });
});

module.exports.editRespondToASituation = asyncWrapper(async (req, res) => {
    const newData = req.body;

    if (!newData) {
        throw new ExpressError(400, "New data is required");
    }

    if ((newData.type && newData.type != 'speaking') || (newData.subtype && newData.subtype != 'respond_to_situation')) {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    const { questionId, ...data } = newData;
    data.type = 'speaking';
    data.subtype = 'respond_to_situation';

    const question = await editQuestion(
        editrespondToASituationSchemaValidator,
        questionId,
        data,
        req.user._id,
        req.file,
        'respondToASituation'
    );

    return res.status(200).json({
        message: "Question updated successfully",
        question,
    });
});

module.exports.getAllRespondToASituation = asyncWrapper(async (req, res) => {
    let query = req.query.query;
    if (!query) query = 'all';
    const { page, limit } = req.query;

    getQuestionByQuery(query, 'respond_to_situation', page, limit, req, res);
});


module.exports.respondToASituationResult = asyncWrapper(async (req, res) => {

    return await speakingrespondToASituationResult({ req, res });
});

// ============================================================
// ANSWER SHORT QUESTION FUNCTIONS
// ============================================================

module.exports.addAnswerShortQuestion = asyncWrapper(async (req, res) => {
    if (!req.file) {
        throw new ExpressError(400, "File is Required");
    }
    const newData = req.body;

    if (!newData) {
        throw new ExpressError(400, "New data is required");
    }

    if (newData.type != 'speaking' || newData.subtype != 'answer_short_question') {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    const { type = 'speaking', subtype = 'answer_short_question', heading, correctText = "" } = newData;
    const newQuestion = await addQuestion(
        answerShortQuestionSchemaValidator,
        { type, subtype, heading, correctText },
        req.user._id,
        req.file,
        'answerShortQuestion',
        true
    );

    return res.status(200).json({
        message: "Question added successfully",
        question: newQuestion,
    });
});

module.exports.editAnswerShortQuestion = asyncWrapper(async (req, res) => {
    const newData = req.body;

    if (!newData) {
        throw new ExpressError(400, "New data is required");
    }

    if ((newData.type && newData.type != 'speaking') || (newData.subtype && newData.subtype != 'answer_short_question')) {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    const { questionId, ...data } = newData;
    data.type = 'speaking';
    data.subtype = 'answer_short_question';

    const question = await editQuestion(
        editanswerShortQuestionSchemaValidator,
        questionId,
        data,
        req.user._id,
        req.file,
        'answerShortQuestion',
        true,
    );

    return res.status(200).json({
        message: "Question updated successfully",
        question,
    });
});

module.exports.getAllAnswerShortQuestion = asyncWrapper(async (req, res) => {
    let query = req.query.query;
    if (!query) query = 'all';
    const { page, limit } = req.query;

    getQuestionByQuery(query, 'answer_short_question', page, limit, req, res);
});


module.exports.answerShortQuestionResult = asyncWrapper(async (req, res) => {
    const { questionId, accent = 'us' } = req.body;
    let mainAudioFile = null;
    let userFilePath = req.file?.path;

    try {
        if (!questionId) throw new ExpressError(400, "questionId is required!");
        if (!req.file) throw new ExpressError(400, "voice is required!");

        const question = await questionsModel.findById(questionId);
        if (!question) throw new ExpressError(404, "Question Not Found!");

        const mainAudioText = question.audioConvertedText;
         const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(req.file.path),
            model: 'whisper-1',
            response_format: 'text',
        });


        const userText = transcription;

        await safeDeleteFile(userFilePath);
        userFilePath = null;

        const correctText = String(question.correctText || "").trim();
        const deterministicResult = correctText
            ? buildDeterministicAnswerShortQuestionResult({ userText, correctText })
            : null;

        if (deterministicResult) {
            const normalizedResponse = deterministicResult;
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
                success: true,
                result: normalizedResponse.result,
                data: normalizedResponse.data,
                assessment: buildAnswerShortQuestionAssessment(normalizedResponse),
            });
        }

        const prompt = `
You are an expert language assessor, and your task is to evaluate the speaking and listening abilities of a user based on a question prompt and their response. Below are the inputs:

**Main Audio Text (Question):**
"${mainAudioText}"

**User's Answer (Response):**
"${userText}"

Please evaluate the user's response in the following categories:
1. **Speaking**: Based on the content and coherence of the user’s spoken answer. The answer should be evaluated based on:
   - How well the user answered the question.
   - How relevant the response is to the question.
   - The organization and clarity of the answer.
   - Score the user’s speaking ability out of 1.
   
2. **Listening**: Based on how well the user understood the question and responded appropriately.
   - Score the user's listening ability out of 1.

3. **Enabling Skills**: Does the user demonstrate clear enabling skills (e.g., vocabulary use, organization of the response)?
   - Mark 'YES' or 'NO'.

4. **Fluency**: Evaluate how smoothly the user speaks without unnatural pauses or hesitation.
   - Score fluency out of 1.

5. **Pronunciation**: Evaluate how well the user pronounces words, including clarity and accuracy.
   - Score pronunciation out of 1.

Please provide the following result in this format and Format your response as JSON it must be just like this i will use that directly to send as response so please give me as this as json :
{
    "Speaking": 0-1,
    "Listening": 0-1, 
    "EnablingSkills": "[YES/NO]", 
    "Fluency": 0-1,
    "Pronunciation": 0-1 
}

`;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an expert language assessor evaluating user responses based on several criteria." },
                { role: "user", content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 500
        });
        const parsedResult = extractJsonObject(response.choices[0].message.content);
        const normalizedResponse = normalizeAnswerShortQuestionScores(parsedResult);
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
            success: true,
            result: normalizedResponse.result,
            data: normalizedResponse.data,
            assessment: buildAnswerShortQuestionAssessment(normalizedResponse),
        });

    } catch (error) {
        if (mainAudioFile) {
            await safeDeleteFile(mainAudioFile);
        }
        if (userFilePath) {
            await safeDeleteFile(userFilePath);
        }

        throw error;
    }
});
