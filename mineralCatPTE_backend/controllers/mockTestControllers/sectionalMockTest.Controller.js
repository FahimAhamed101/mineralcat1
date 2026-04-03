const { sectionalMockTestSchemaValidator } = require("../../validations/schemaValidations");
const { asyncWrapper } = require("../../utils/AsyncWrapper");
const sectionalMockTestModel = require("../../models/sectionalMockTest.model");
const mockTestResultModel = require("../../models/mockTestResult.model");
const supscriptionModel = require("../../models/supscription.model");
const questionsModel = require("../../models/questions.model");
const { default: axios } = require("axios");
const { default: mongoose } = require("mongoose");
const practicedModel = require("../../models/practiced.model");
const fs = require('fs');
const FormData = require("form-data");
const ExpressError = require("../../utils/ExpressError");
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

const INTERNAL_REQUEST_KEY =
    process.env.INTERNAL_API_KEY ||
    process.env.JWT_SECRET ||
    process.env.ACCESS_TOKEN_SECRET ||
    process.env.REFRESH_TOKEN_SECRET ||
    "";

const subtypeApiUrls = {
    read_aloud: `${process.env.BACKENDURL}/test/speaking/read_aloud/result`,
    repeat_sentence: `${process.env.BACKENDURL}/test/speaking/repeat_sentence/result`,
    describe_image: `${process.env.BACKENDURL}/result/describe_image`,
    respond_to_situation: `${process.env.BACKENDURL}/test/speaking/respond-to-a-situation/result`,
    answer_short_question: `${process.env.BACKENDURL}/test/speaking/answer_short_question/result`,

    summarize_written_text: `${process.env.BACKENDURL}/test/writing/summerize-written-text/result`,
    write_email: `${process.env.BACKENDURL}/test/writing/write_email/result`,

    rw_fill_in_the_blanks: `${process.env.BACKENDURL}/test/reading/fill-in-the-blanks/result`,
    mcq_multiple: `${process.env.BACKENDURL}/test/reading/mcq_multiple/result`,
    reorder_paragraphs: `${process.env.BACKENDURL}/test/reading/reorder-paragraphs/result`,
    reading_fill_in_the_blanks: `${process.env.BACKENDURL}/test/reading/reading-fill-in-the-blanks/result`,
    mcq_single: `${process.env.BACKENDURL}/test/reading/mcq_single/result`,

    summarize_spoken_text: `${process.env.BACKENDURL}/test/listening/summarize-spoken-text/result`,
    listening_fill_in_the_blanks: `${process.env.BACKENDURL}/test/listening/listening-fill-in-the-blanks/result`,
    listening_multiple_choice_multiple_answers: `${process.env.BACKENDURL}/test/listening/multiple-choice-multiple-answers/result`,
    listening_multiple_choice_single_answers: `${process.env.BACKENDURL}/test/listening/multiple-choice-single-answers/result`
};

module.exports.addSectionalMockTest = asyncWrapper(async (req, res) => {
    const { error, value } = sectionalMockTestSchemaValidator.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { type, name, aiCreditCost = 1, duration, questions } = value;

    // Create a new sectional mock test
    const sectionalMockTest = await sectionalMockTestModel.create({
        type,
        name,
        aiCreditCost,
        duration,
        questions,
        createdBy: req.user._id
    });

    return res.status(201).json({ message: 'Sectional Mock Test created successfully', sectionalMockTest });
})

module.exports.getAllSectionalMockTest = asyncWrapper(async (req, res) => {
    const { type } = req.params;
    if (!type) {
        return res.status(400).json({ message: 'Type is required' });
    }
    const sectionalMockTests = await sectionalMockTestModel.find({ type }, { name: 1, duration: 1, aiCreditCost: 1 }).sort({ createdAt: -1 });

    const totalCount = await sectionalMockTestModel.countDocuments();
    if (!sectionalMockTests || sectionalMockTests.length === 0) {
        return res.status(404).json({ message: 'No sectional mock tests found for this type' });
    }

    return res.status(200).json({ message: 'Sectional Mock Tests retrieved successfully', totalCount, sectionalMockTests });
})

module.exports.getSingleSectionalMockTest = async (req, res) => {
    const { id } = req.params;
    try {
        const mockTest = await sectionalMockTestModel.findById(id).populate("questions");
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

module.exports.deleteSectionalMockTest = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'ID is required' });
    }
    const sectionalMockTest = await sectionalMockTestModel.findByIdAndDelete(id);
    if (!sectionalMockTest) {
        return res.status(404).json({ message: 'Sectional Mock Test not found' });
    }

    return res.status(200).json({ message: 'Sectional Mock Test deleted successfully', sectionalMockTest });
})

module.exports.mockTestResult = async (req, res, next) => {
    const userId = req.user?._id;
    let creditsDeducted = false;
    try {
        const { questionId, mockTestId } = req.body;

        if (!questionId || !mockTestId)
            throw new ExpressError(400, 'questionId and mockTestId are required');

        const question = await questionsModel.findById(questionId).lean();
        if (!question) throw new ExpressError(404, 'Invalid questionId or question not found');

        const mockTest = await sectionalMockTestModel.findById(mockTestId).lean();
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

        const sectionalCost = Number(mockTest.aiCreditCost ?? 1);
        if (!hasCurrentAttempt) {
            if (subscription.credits < sectionalCost) {
                return res.status(403).json({ success: false, message: `You need ${sectionalCost} AI credits to start this sectional mock test` });
            }

            await supscriptionModel.findOneAndUpdate(
                { _id: subscription._id },
                {
                    $inc: {
                        credits: -sectionalCost,
                    }
                }
            );
            creditsDeducted = true;
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

        if (creditsDeducted) {
            const mockTest = await sectionalMockTestModel.findById(req.body.mockTestId).select("aiCreditCost").lean();
            const sectionalCost = Number(mockTest?.aiCreditCost ?? 1);
            await supscriptionModel.findOneAndUpdate(
                { _id: subscription._id },
                {
                    $inc: {
                        credits: sectionalCost,
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
            { $addToSet: { completedSectionalTests: mockTestId } },
            { upsert: true }
        );
    }


    res.status(200).json({
        success: true,
        data: formattedResult,
    });
});
