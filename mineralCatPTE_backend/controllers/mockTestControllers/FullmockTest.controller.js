const FullmockTestSchema = require("../../models/mock_test.model");
const { mockTestSchemaValidator } = require("../../validations/schemaValidations");
const questionsModel = require("../../models/questions.model");
const { default: axios } = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const ExpressError = require("../../utils/ExpressError");
const mockTestResultModel = require("../../models/mockTestResult.model");
const { asyncWrapper } = require("../../utils/AsyncWrapper");
const { default: mongoose } = require("mongoose");
const practicedModel = require("../../models/practiced.model");
const supscriptionModel = require("../../models/supscription.model");
const {
    getMockQuestionScore,
    hasAttemptForAttemptId,
    isAnsweredMockSubmission,
    normalizeAttemptId,
    parseSerializedRequestData,
} = require("./questionResultHelper/mockTestSubmission.helper");
const {
    buildEmptyFormattedMockTestResult,
    buildFormattedMockTestResult,
} = require("./questionResultHelper/mockTestFormatting.helper");

const BACKENDURL = process.env.BACKENDURL;
const INTERNAL_REQUEST_KEY =
    process.env.INTERNAL_API_KEY ||
    process.env.JWT_SECRET ||
    process.env.ACCESS_TOKEN_SECRET ||
    process.env.REFRESH_TOKEN_SECRET ||
    "";

const subtypeApiUrls = {
    read_aloud: `${BACKENDURL}/test/speaking/read_aloud/result`,
    repeat_sentence: `${BACKENDURL}/test/speaking/repeat_sentence/result`,
    describe_image: `${BACKENDURL}/result/describe_image`,
    respond_to_situation: `${BACKENDURL}/test/speaking/respond-to-a-situation/result`,
    answer_short_question: `${BACKENDURL}/test/speaking/answer_short_question/result`,

    summarize_written_text: `${BACKENDURL}/test/writing/summerize-written-text/result`,
    write_email: `${BACKENDURL}/test/writing/write_email/result`,

    rw_fill_in_the_blanks: `${BACKENDURL}/test/reading/fill-in-the-blanks/result`,
    mcq_multiple: `${BACKENDURL}/test/reading/mcq_multiple/result`,
    reorder_paragraphs: `${BACKENDURL}/test/reading/reorder-paragraphs/result`,
    reading_fill_in_the_blanks: `${BACKENDURL}/test/reading/reading-fill-in-the-blanks/result`,
    mcq_single: `${BACKENDURL}/test/reading/mcq_single/result`,

    summarize_spoken_text: `${BACKENDURL}/test/listening/summarize-spoken-text/result`,
    listening_fill_in_the_blanks: `${BACKENDURL}/test/listening/listening-fill-in-the-blanks/result`,
    listening_multiple_choice_multiple_answers: `${BACKENDURL}/test/listening/multiple-choice-multiple-answers/result`,
    listening_multiple_choice_single_answers: `${BACKENDURL}/test/listening/multiple-choice-single-answers/result`
};

module.exports.addMockTest = async (req, res) => {

    const { error, value } = mockTestSchemaValidator.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }
    const { name, duration: { hours, minutes }, questions } = value;
    const userId = req.user._id;

    const newMockTest = await FullmockTestSchema.create({
        name,
        duration: {
            hours,
            minutes
        },
        questions,
        createdBy: userId
    });

    if (!newMockTest) {
        return res.status(500).json({
            success: false,
            message: "Failed to create mock test"
        });
    }
    return res.status(201).json({
        success: true,
        message: "Mock test created successfully",
        data: newMockTest
    });
}


module.exports.getSingleMockTest = async (req, res) => {
    const { id } = req.params;
    try {
        const mockTest = await FullmockTestSchema.findById(id).populate("questions");
        console.log(mockTest);

        if (!mockTest) {
            return res.status(404).json({ message: "Mock test not found" });
        }
        res.status(200).json(mockTest);
    } catch (error) {
        console.error("Error fetching mock test:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


module.exports.updateMockTest = async (req, res) => {
    const { id } = req.params;
    const { name, duration: { hours, minutes } } = req.body;

    try {
        const updatedMockTest = await FullmockTestSchema.findByIdAndUpdate(
            id,
            {
                name,
                duration: {
                    hours,
                    minutes
                }
            },
            { new: true }
        );

        if (!updatedMockTest) {
            return res.status(404).json({ message: "Mock test not found" });
        }

        res.status(200).json(updatedMockTest);
    } catch (error) {
        console.error("Error updating mock test:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


module.exports.deleteMockTest = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedMockTest = await FullmockTestSchema.findByIdAndDelete(id);

        if (!deletedMockTest) {
            return res.status(404).json({ message: "Mock test not found" });
        }

        res.status(200).json({ message: "Mock test deleted successfully" });
    } catch (error) {
        console.error("Error deleting mock test:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


module.exports.getAllMockTests = async (req, res) => {
    try {
        const FullmockTests = await FullmockTestSchema.find({}, { name: 1, duration: 1 })
            .sort({ createdAt: -1 });

        const totalCount = await FullmockTestSchema.countDocuments();

        res.status(200).json({
            totalCount,
            FullmockTests
        });
    } catch (error) {
        console.error("Error fetching mock tests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.mockTestResult = async (req, res, next) => {
    const userId = req.user?._id;
    let mockTokenDeducted = false;
    try {
        const { questionId, mockTestId } = req.body;

        if (!questionId || !mockTestId)
            throw new ExpressError(400, 'questionId and mockTestId are required');

        const question = await questionsModel.findById(questionId).lean();
        if (!question) throw new ExpressError(404, 'Invalid questionId or question not found');

        const mockTest = await FullmockTestSchema.findById(mockTestId).lean();
        if (!mockTest) throw new ExpressError(404, 'Invalid mockTestId or mock test not found');

        const isQuestionInMockTest = mockTest.questions.some(qId => qId.toString() === questionId);
        if (!isQuestionInMockTest)
            throw new ExpressError(400, 'This question does not belong to the specified mock test');

        const apiUrl = subtypeApiUrls[question.subtype];
        if (!apiUrl) throw new ExpressError(400, 'Unsupported question subtype');

        const newData = parseSerializedRequestData(req.body);

        const attemptId = normalizeAttemptId(newData.attemptId);
        if (!attemptId) {
            throw new ExpressError(400, 'attemptId is required');
        }

        if (!isAnsweredMockSubmission({ answer: newData.answer, file: req.file })) {
            if (req.file?.path) {
                fs.unlink(req.file.path, err => {
                    if (err) console.warn('Failed to delete file:', err);
                });
            }

            return res.status(200).json({
                success: true,
                skipped: true,
                message: 'Question skipped without an answer. No score recorded.',
            });
        }

        let mockTestResult = await mockTestResultModel.findOne({ user: userId, mockTest: mockTestId });
        const hasCurrentAttempt = hasAttemptForAttemptId(mockTestResult, attemptId);

        const subscription = await supscriptionModel.findOne({
            user: userId,
            isActive: true
        });

        if (!subscription) {
            return res.status(404).json({ success: false, message: "Active subscription not found" });
        }

        if (!hasCurrentAttempt) {
            if (subscription.mockTestLimit <= 0) {
                return res.status(403).json({ success: false, message: "Your mock test balance is 0" });
            }

            await supscriptionModel.findOneAndUpdate(
                { _id: subscription._id },
                {
                    $inc: {
                        mockTestLimit: -1,
                    }
                }
            );
            mockTokenDeducted = true;
        }

        let response;
        const requestHeaders = {
            Authorization: req.headers.authorization || '',
            ...(INTERNAL_REQUEST_KEY ? { 'x-internal-request-key': INTERNAL_REQUEST_KEY } : {}),
        };

        if (req.file) {
            const form = new FormData();
            for (const key in newData) {
                form.append(key, typeof newData[key] === 'object' ? JSON.stringify(newData[key]) : newData[key]);
            }
            form.append('voice', fs.createReadStream(req.file.path));

            response = await axios.post(apiUrl, form, {
                headers: {
                    ...form.getHeaders(),
                    ...requestHeaders,
                },
            });

            fs.unlink(req.file.path, err => {
                if (err) console.warn('Failed to delete file:', err);
            });
        } else {
            response = await axios.post(apiUrl, newData, {
                headers: requestHeaders,
            });
        }

        const scoreData = response.data;
        if (scoreData?.error) {
            throw new ExpressError(400, scoreData.error);
        }

        const score = getMockQuestionScore(question.subtype, scoreData);

        const attempt = {
            questionId,
            questionSubtype: question.subtype,
            attemptId,
            score,
            submittedAt: new Date(),
        };

        if (!mockTestResult) {
            // Create new doc with first result entry
            mockTestResult = await mockTestResultModel.create({
                user: userId,
                mockTest: mockTestId,
                results: [
                    {
                        type: question.type,
                        averageScore: score,
                        attempts: [attempt],
                    },
                ],
            });
        } else {
            // Check if a result entry for this question type exists
            const existingResult = mockTestResult.results.find(r => r.type === question.type);
            if (existingResult) {
                existingResult.attempts.push(attempt);
                // Recalculate averageScore
                const total = existingResult.attempts.reduce((acc, a) => acc + a.score, 0);
                existingResult.averageScore = total / existingResult.attempts.length;
            } else {
                // Add new result entry for this type
                mockTestResult.results.push({
                    type: question.type,
                    averageScore: score,
                    attempts: [attempt],
                });
            }
            await mockTestResult.save();
        }

        return res.status(200).json({
            success: true,
            data: scoreData,
            score,
        });
    } catch (error) {
        const subscription = await supscriptionModel.findOne({
            user: userId,
            isActive: true
        });

        if (!subscription) {
            return res.status(404).json({ success: false, message: "Active subscription not found" });
        }

        if (mockTokenDeducted) {
            await supscriptionModel.findOneAndUpdate(
                { _id: subscription._id },
                {
                    $inc: {
                        mockTestLimit: 1,
                    }
                }
            );
        }
        next(error);
    }
};



module.exports.getFormattedMockTestResult = asyncWrapper(async (req, res) => {
    const { mockTestId } = req.params;
    const userId = req.user._id;
    const attemptId = normalizeAttemptId(req.query.attemptId);

    if (!mongoose.Types.ObjectId.isValid(mockTestId)) {
        return res.status(400).json({ success: false, message: 'Invalid mock test ID' });
    }

    if (!attemptId) {
        return res.status(400).json({
            success: false,
            message: 'attemptId is required',
        });
    }

    const mockTestResultDoc = await mockTestResultModel.findOne({ mockTest: mockTestId, user: userId });

    if (!mockTestResultDoc) {
        return res.status(200).json({
            success: true,
            data: buildEmptyFormattedMockTestResult(Date.now()),
        });
    }

    const formattedResult = await buildFormattedMockTestResult(mockTestResultDoc, {
        attemptId,
        referenceDate: Date.now(),
    });

    if (formattedResult.completedTaskCount > 0) {
        await practicedModel.updateOne(
            { user: userId },
            { $addToSet: { completedMockTests: mockTestId } },
            { upsert: true }
        );
    }


    res.status(200).json({
        success: true,
        data: formattedResult,
    });
});
