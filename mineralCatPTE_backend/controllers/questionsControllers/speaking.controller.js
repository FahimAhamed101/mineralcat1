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
const { asyncWrapper } = require("../../utils/AsyncWrapper");
const fsPromises = require('fs').promises;
const practicedModel = require("../../models/practiced.model");
const { getQuestionByQuery } = require("../../common/getQuestionFunction");
const {
    buildAnswerShortQuestionAssessment,
    buildRepeatSentenceAssessment,
} = require("../../common/questionAssessment");
const { scoreOpenEndedSpeech } = require("../../services/speechace.service");
const {
    mapOpenEndedSpeechResponse,
    speakingReadAloudResult,
    speakingevaluateRepeatSentenceResult,
    speakingrespondToASituationResult,
} = require("../mockTestControllers/questionResultHelper/fullMockTest.result.controller");


function getSpeechAceTranscript(fullResponse) {
    const speechScore = fullResponse?.speech_score || {};
    const transcript = String(speechScore.transcript || '').trim();
    if (transcript) return transcript;

    const wordScoreList = Array.isArray(speechScore.word_score_list)
        ? speechScore.word_score_list
        : [];

    return wordScoreList
        .map((wordScore) => String(
            wordScore?.word ??
            wordScore?.text ??
            wordScore?.token ??
            wordScore?.display ??
            ''
        ).trim())
        .filter(Boolean)
        .join(' ')
        .trim();
}

async function transcribeAudioFile(audioFile) {
    if (!audioFile?.path) {
        throw new ExpressError(400, "Audio file is required for transcription");
    }

    try {
        const speechResponse = await scoreOpenEndedSpeech({
            audioFilePath: audioFile.path,
        });
        const transcript = getSpeechAceTranscript(speechResponse);

        if (!transcript) {
            throw new ExpressError(422, "SpeechAce did not return a transcript for this audio file");
        }

        return transcript;
    } catch (error) {
        if (error?.status === 422) {
            throw error;
        }

        throw new ExpressError(
            502,
            `SpeechAce transcription failed: ${error?.message || "SpeechAce request failed"}`
        );
    }
}
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

function hasCloudinaryCredentials() {
    return Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
}

function buildLocalUploadUrl(file, req) {
    if (!req) {
        throw new ExpressError(500, "Request context is required for local audio uploads");
    }

    const fileName = path.basename(file.path);
    return `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
}

function canUseLocalUploadFallback(req) {
    if (process.env.LOCAL_UPLOAD_FALLBACK === 'true') {
        return true;
    }

    if (process.env.NODE_ENV !== 'production') {
        return true;
    }

    const host = String(req?.get?.('host') || '').toLowerCase();
    return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}

function getAudioUploadPublicId(file) {
    const baseName = path.basename(file.originalname, path.extname(file.originalname));
    const safeBaseName = baseName
        .replace(/[^a-z0-9_-]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'audio';

    return `${safeBaseName}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function clampScore(value, min, max) {
    return Math.min(Math.max(value, min), max);
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
        .split(/\r?\n|\||;/)
        .map((item) => item.trim())
        .filter(Boolean);

    return variants.length ? variants : [raw];
}

function toBinarySpeechAceTraitScore(value, minimumPassingScore = 3) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return 0;
    }

    return clampScore(Math.round(numericValue), 0, 5) >= minimumPassingScore ? 1 : 0;
}

function buildAnswerShortQuestionResponse({
    userText = "",
    correctText = "",
    speakingScore = 0,
    listeningScore = 0,
    enablingSkills = "NO",
    fluency = 0,
    pronunciation = 0,
    matchedExpectedAnswer = false,
} = {}) {
    const normalizedSpeakingScore = clampScore(Number(speakingScore) || 0, 0, 1);
    const normalizedListeningScore = clampScore(Number(listeningScore) || 0, 0, 1);
    const normalizedFluency = clampScore(Number(fluency) || 0, 0, 1);
    const normalizedPronunciation = clampScore(Number(pronunciation) || 0, 0, 1);
    const normalizedEnablingSkills = String(enablingSkills || '').trim().toUpperCase() === 'YES'
        ? 'YES'
        : 'NO';

    return {
        result: {
            Speaking: normalizedSpeakingScore,
            Listening: normalizedListeningScore,
            EnablingSkills: normalizedEnablingSkills,
            Fluency: normalizedFluency,
            Pronunciation: normalizedPronunciation,
        },
        data: {
            speakingScore: normalizedSpeakingScore,
            listeningScore: normalizedListeningScore,
            fluency: normalizedFluency,
            pronunciation: normalizedPronunciation,
            enablingSkills: normalizedEnablingSkills,
            predictedText: userText,
            correctText,
            matchedExpectedAnswer: Boolean(matchedExpectedAnswer),
        },
    };
}

function buildDeterministicAnswerShortQuestionResult({
    userText = "",
    correctText = "",
    fluency = 0,
    pronunciation = 0,
} = {}) {
    const normalizedUserText = normalizeComparableText(userText);
    const acceptedAnswers = getAcceptedAnswerVariants(correctText);
    const normalizedAcceptedAnswers = acceptedAnswers
        .map((answer) => normalizeComparableText(answer))
        .filter(Boolean);

    const isCorrect =
        Boolean(normalizedUserText) &&
        normalizedAcceptedAnswers.some((answer) => answer === normalizedUserText);

    return buildAnswerShortQuestionResponse({
        userText,
        correctText,
        speakingScore: isCorrect ? 1 : 0,
        listeningScore: isCorrect ? 1 : 0,
        enablingSkills: isCorrect ? "YES" : "NO",
        fluency,
        pronunciation,
        matchedExpectedAnswer: isCorrect,
    });
}

function isNoSpeechDetectedError(error) {
    const message = String(error?.message || '').toLowerCase();

    return (
        message.includes('error_no_speech') ||
        message.includes('no speech was detected') ||
        message.includes('no speech is detected')
    );
}

function buildSpeechAceAnswerShortQuestionResult({
    userText = "",
    correctText = "",
    speechMetrics = {},
} = {}) {
    const normalizedUserText = String(userText || "").trim();
    const normalizedCorrectText = String(correctText || "").trim();
    const fluency = toBinarySpeechAceTraitScore(speechMetrics.fluency);
    const pronunciation = toBinarySpeechAceTraitScore(speechMetrics.pronunciation);

    return buildDeterministicAnswerShortQuestionResult({
        userText: normalizedUserText,
        correctText: normalizedCorrectText,
        fluency,
        pronunciation,
    });
}

async function uploadToCloudinary(file, folderName, req) {
    if (!file) {
        throw new ExpressError(400, "Please upload a file");
    }

    if (!file.path) {
        throw new ExpressError(400, "Uploaded file path is missing");
    }

    if (!hasCloudinaryCredentials()) {
        if (!canUseLocalUploadFallback(req)) {
            throw new ExpressError(500, "Cloudinary is not configured for audio uploads");
        }

        return buildLocalUploadUrl(file, req);
    }

    const uploadOptions = {
        folder: `listening_test/${folderName}`,
        public_id: getAudioUploadPublicId(file),
        type: "upload",
        use_filename: false,
        unique_filename: false,
        overwrite: false,
    };

    try {
        console.log("Uploading audio to Cloudinary:", {
            path: file.path,
            originalname: file.originalname,
            mimetype: file.mimetype,
            uploadOptions,
        });

        const result = await cloudinary.uploader.upload_large(
            file.path,
            uploadOptions,
            {
                resource_type: "video",
            }
        );

        await safeDeleteFile(file.path);
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary audio upload failed:", error);

        await safeDeleteFile(file.path);

        throw new ExpressError(
            502,
            `Audio upload failed: ${error?.message || "Cloudinary upload failed"}`
        );
    }
}

async function uploadAudioFile(file, folderName, req) {
    try {
        return await uploadToCloudinary(file, folderName, req);
    } catch (error) {
        const message = String(error?.message || '');

        if (
            canUseLocalUploadFallback(req) &&
            message.toLowerCase().includes('image file format')
        ) {
            return buildLocalUploadUrl(file, req);
        }

        throw error;
    }
}

async function addQuestion(validator, data, userId, audioFile = null, folderName = null, convertToText = false, req = null) {
    const { error, value } = validator.validate(data);
    if (error) throw new ExpressError(400, error.details[0].message);

    let questionData = {
        ...value,
        createdBy: userId,
    };

    if (audioFile && convertToText === true) {
        try {
            questionData.audioConvertedText = await transcribeAudioFile(audioFile);
        } catch (error) {
            await safeDeleteFile(audioFile.path);
            throw error;
        }
    }
    if (audioFile && folderName) {
        questionData.audioUrl = await uploadAudioFile(audioFile, folderName, req);
    }

    const newQuestion = await questionsModel.create(questionData);
    return newQuestion;
}

async function editQuestion(validator, questionId, data, userId, audioFile = null, folderName = null, convertToText = false, req = null) {
    const { error, value } = validator.validate(data);
    if (error) throw new ExpressError(400, error.details[0].message);

    if (!questionId) throw new ExpressError(400, "Question ID is required");

    if (audioFile && folderName && convertToText) {
        try {
            value.audioConvertedText = await transcribeAudioFile(audioFile);
        } catch (error) {
            await safeDeleteFile(audioFile.path);
            throw error;
        }
    }
    if (audioFile && folderName) {
        // Upload to Cloudinary
        const audioUrl = await uploadAudioFile(audioFile, folderName, req);
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

    if (!req.file) {
        throw new ExpressError(400, "File is Required");
    }

    const { type = 'speaking', subtype = 'repeat_sentence', heading } = newData;
    const audioConvertedText = String(newData.audioConvertedText || '').trim();
    const shouldTranscribeAudio = !audioConvertedText;
    const newQuestion = await addQuestion(
        repeatSentenceSchemaValidator,
        {
            type,
            subtype,
            heading,
            ...(audioConvertedText ? { audioConvertedText } : {}),
        },
        req.user._id,
        req.file,
        'repeatSentence',
        shouldTranscribeAudio,
        req
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
    if (typeof data.audioConvertedText === 'string') {
        data.audioConvertedText = data.audioConvertedText.trim();
    }

    const shouldTranscribeAudio = Boolean(req.file && !data.audioConvertedText);

    const question = await editQuestion(
        editrepeatSentenceSchemaValidator,
        questionId,
        data,
        req.user._id,
        req.file,
        'repeatSentence',
        shouldTranscribeAudio,
        req
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
        'respondToASituation',
        false,
        req
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
        'respondToASituation',
        false,
        req
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
        true,
        req
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

    const existingQuestion = await questionsModel.findById(questionId);
    if (!existingQuestion) {
        throw new ExpressError(404, 'Question not found');
    }

    const nextCorrectText = typeof data.correctText === 'string'
        ? data.correctText
        : existingQuestion.correctText;

    if (!String(nextCorrectText || '').trim()) {
        throw new ExpressError(400, 'Accepted answers are required');
    }

    data.correctText = nextCorrectText;

    const question = await editQuestion(
        editanswerShortQuestionSchemaValidator,
        questionId,
        data,
        req.user._id,
        req.file,
        'answerShortQuestion',
        true,
        req
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
    let userFilePath = req.file?.path;

    try {
        if (!questionId) throw new ExpressError(400, "questionId is required!");
        if (!req.file) throw new ExpressError(400, "voice is required!");

        const question = await questionsModel.findById(questionId);
        if (!question) throw new ExpressError(404, "Question Not Found!");
        if (question.subtype !== 'answer_short_question') {
            throw new ExpressError(401, "this is not valid questionType for this route!");
        }

        const correctText = String(question.correctText || "").trim();
        let normalizedResponse;

        try {
            const speechResponse = await scoreOpenEndedSpeech({
                audioFilePath: userFilePath,
                relevanceContext: question.audioConvertedText || question.prompt || question.heading,
                accent,
            });
            const speechMetrics = mapOpenEndedSpeechResponse(speechResponse);

            normalizedResponse = buildSpeechAceAnswerShortQuestionResult({
                userText: speechMetrics.predictedText || "",
                correctText,
                speechMetrics,
            });
        } catch (error) {
            if (!isNoSpeechDetectedError(error)) {
                throw error;
            }

            normalizedResponse = buildAnswerShortQuestionResponse({
                userText: "",
                correctText,
                speakingScore: 0,
                listeningScore: 0,
                enablingSkills: "NO",
                fluency: 0,
                pronunciation: 0,
                matchedExpectedAnswer: false,
            });
        }

        await safeDeleteFile(userFilePath);
        userFilePath = null;

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

        /* Legacy GPT fallback removed.
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
        normalizedResponse = normalizeAnswerShortQuestionScores(parsedResult);
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
        */

    } catch (error) {
        if (userFilePath) {
            await safeDeleteFile(userFilePath);
        }

        throw error;
    }
});
