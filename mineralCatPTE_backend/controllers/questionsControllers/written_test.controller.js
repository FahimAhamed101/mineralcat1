const questionsModel = require("../../models/questions.model");
const ExpressError = require("../../utils/ExpressError");
const {
    addSummarizeTextSchemaValidator,
    writeEmailSchemaValidator,
    EditWriteEmailSchemaValidator
} = require("../../validations/schemaValidations");
const { asyncWrapper } = require("../../utils/AsyncWrapper");
const { OpenAI } = require('openai');
const practicedModel = require("../../models/practiced.model");
const { getQuestionByQuery } = require("../../common/getQuestionFunction");
const {
    buildSummarizeWrittenTextAssessment,
    buildWriteEmailAssessment,
} = require("../../common/questionAssessment");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function countWords(text = "") {
    return String(text)
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;
}

function getWriteEmailFormScore(wordCount) {
    if (wordCount >= 50 && wordCount <= 120) {
        return 2;
    }

    if ((wordCount >= 30 && wordCount <= 49) || (wordCount >= 121 && wordCount <= 140)) {
        return 1;
    }

    return 0;
}

function enforceSummarizeWrittenTextScore(result = {}) {
    const content = Number(result.content) || 0;
    const form = Number(result.form) || 0;
    const grammar = Number(result.grammar) || 0;
    const vocabularyRange = Number(result.vocabularyRange) || 0;

    return {
        ...result,
        content,
        form,
        grammar,
        vocabularyRange,
        score: content === 0 || form === 0
            ? 0
            : content + form + grammar + vocabularyRange,
    };
}

function enforceWriteEmailScore(result = {}, answer = "") {
    const wordCount = countWords(answer);
    const content = Number(result.content) || 0;
    const grammar = Number(result.grammar) || 0;
    const spelling = Number(result.spelling) || 0;
    const organization = Number(result.organization) || 0;
    const emailConvention = Number(result.emailConvention) || 0;
    const vocabularyRange = Number(result.vocabularyRange) || 0;
    const form = getWriteEmailFormScore(wordCount);

    if (content === 0) {
        return {
            ...result,
            content: 0,
            grammar: 0,
            spelling: 0,
            form: 0,
            organization: 0,
            emailConvention: 0,
            vocabularyRange: 0,
            wordCount,
            noFurtherScoring: true,
            gatingReason: "content",
            score: 0,
        };
    }

    if (form === 0) {
        return {
            ...result,
            content,
            grammar: 0,
            spelling: 0,
            form: 0,
            organization: 0,
            emailConvention: 0,
            vocabularyRange: 0,
            wordCount,
            noFurtherScoring: true,
            gatingReason: "form",
            score: 0,
        };
    }

    return {
        ...result,
        content,
        grammar,
        spelling,
        form,
        organization,
        emailConvention,
        vocabularyRange,
        wordCount,
        noFurtherScoring: false,
        gatingReason: "",
        score: content + grammar + spelling + form + organization + emailConvention + vocabularyRange,
    };
}

// --------------------------- summarize written text ---------------------

module.exports.addSummarizeWrittenText = asyncWrapper(async (req, res) => {
    if (req.body.type != 'writing' || req.body.subtype != 'summarize_written_text') {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }
    const { error, value } = addSummarizeTextSchemaValidator.validate(req.body);

    const { type = 'writing', subtype = 'summarize_written_text', heading, prompt } = value;

    if (error) throw new ExpressError(400, error.details[0].message);

    value.createdBy = req.user._id;

    const newQuestion = await questionsModel.create({
        type,
        subtype,
        heading,
        prompt,
    });

    res.status(200).json({ data: newQuestion });
});

module.exports.editSummarizeWrittenText = asyncWrapper(async (req, res) => {
    if ((req.body.newData.type && req.body.newData.type != 'writing') || (req.body.newData.subtype && req.body.newData.subtype != 'summarize_written_text')) {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }
    const { questionId, newData } = req.body;


    const { error, value } = addSummarizeTextSchemaValidator.validate(newData);

    const { type = 'writing', subtype = 'summarize_written_text', heading, text } = value;


    if (error) throw new ExpressError(400, error.details[0].message);

    if (!questionId) throw new ExpressError(401, "Question Id required");

    await questionsModel.findByIdAndUpdate(questionId, {
        type,
        subtype,
        heading,
        text,
    });


    res.status(200).json({ message: "Question Updated Successfully" });
});

module.exports.getSummarizeWrittenText = asyncWrapper(async (req, res) => {
    let query = req.query.query;
    if (!query) query = 'all';
    const { page, limit } = req.query;
    getQuestionByQuery(query, 'summarize_written_text', page, limit, req, res);
});

module.exports.summarizeWrittenTextResult = asyncWrapper(async (req, res) => {
    const { questionId, answer } = req.body;

    if (!questionId || !answer) {
        throw new ExpressError(400, "questionId and answer are required!");
    }

    const question = await questionsModel.findById(questionId);
    if (!question) {
        throw new ExpressError(404, "Question not found");
    }

    if (question.subtype !== 'summarize_written_text') {
        throw new ExpressError(401, "this is not valid questionType for this route!");
    }

    const originalParagraph = question.prompt;

    const prompt = `
You are an expert assessor for PTE Core Summarize Written Text responses.

Original Paragraph:
${originalParagraph}

User's Summary:
${answer}

Evaluate the response using these rules:
- The response should stay within 25-50 words.
- Score the summary out of 8.
- Use these traits only:
  - Content (0-2)
  - Form (0-2)
  - Grammar (0-2)
  - Vocabulary (0-2)
- If Content = 0 or Form = 0, the overall Score must be 0.

Return the result in exactly this format and nothing else:

Score: X/8
Enabling Skills:
Content: X/2
Form: X/2
Grammar: X/2
Vocabulary: X/2

Feedback: Your feedback goes here
`;

    try {
        const gptResponse = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: "system",
                    content: "You are an expert assessor for PTE Core summarize written text responses."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        const gptResult = gptResponse.choices[0].message.content;
        const parsedResult = enforceSummarizeWrittenTextScore(parseGPTResponse(gptResult));

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
            ...parsedResult,
            assessment: buildSummarizeWrittenTextAssessment(parsedResult),
        });
    } catch (error) {
        console.error(error);
        throw new ExpressError(500, "An error occurred while processing the request.");
    }
});

function parseGPTResponse(responseText) {
    try {
        const scoreMatch = responseText.match(/Score:\s*([\d.]+)\s*\/\s*8/i);
        const contentMatch = responseText.match(/Content:\s*([\d.]+)\s*\/\s*2/i);
        const formMatch = responseText.match(/Form:\s*([\d.]+)\s*\/\s*2/i);
        const grammarMatch = responseText.match(/Grammar:\s*([\d.]+)\s*\/\s*2/i);
        const vocabMatch = responseText.match(/Vocabulary(?: Range)?:\s*([\d.]+)\s*\/\s*2/i);
        const feedbackMatch = responseText.match(/Feedback:\s*(.*)/is);

        if (!scoreMatch || !contentMatch || !grammarMatch || !formMatch || !vocabMatch) {
            throw new Error("Incomplete matches in GPT response");
        }

        return {
            score: parseFloat(scoreMatch[1]),
            content: parseFloat(contentMatch[1]),
            grammar: parseFloat(grammarMatch[1]),
            form: parseFloat(formMatch[1]),
            vocabularyRange: parseFloat(vocabMatch[1]),
            feedback: feedbackMatch ? feedbackMatch[1].trim() : "No feedback provided."
        };
    } catch (err) {
        console.error("GPT Response:\n", responseText);
        throw new Error("Unable to parse GPT response");
    }
}

// ------------------- write email --------------------------------------

module.exports.addWriteEmail = asyncWrapper(async (req, res) => {
    if (req.body.type != 'writing' || req.body.subtype != 'write_email') {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }

    const { error, value } = writeEmailSchemaValidator.validate(req.body);

    const { type = 'writing', subtype = 'write_email', heading, prompt } = value;

    if (error) throw new ExpressError(400, error.details[0].message);

    value.createdBy = req.user._id;

    const newQuestion = await questionsModel.create({
        type,
        subtype,
        heading,
        prompt,
    });

    res.status(200).json({ data: newQuestion });
});

module.exports.editWriteEmail = asyncWrapper(async (req, res) => {
    if ((req.body.newData.type && req.body.newData.type != 'writing') || (req.body.newData.subtype && req.body.newData.subtype != 'write_email')) {
        throw new ExpressError(400, "question type or subtype is not valid!");
    }
    const { questionId, newData } = req.body;


    const { error, value } = EditWriteEmailSchemaValidator.validate(newData);

    const { type = 'writing', subtype = 'write_email', heading, prompt } = value;


    if (error) throw new ExpressError(400, error.details[0].message);

    if (!questionId) throw new ExpressError(401, "Question Id required");

    await questionsModel.findByIdAndUpdate(questionId, {
        type,
        subtype,
        heading,
        prompt,
    });


    res.status(200).json({ message: "Question Updated Successfully" });
});

module.exports.getWriteEmail = asyncWrapper(async (req, res) => {
    let query = req.query.query;
    if (!query) query = 'all';
    const { page, limit } = req.query;

    getQuestionByQuery(query, 'write_email', page, limit, req, res);
});

module.exports.writeEmailResult = asyncWrapper(async (req, res) => {
    const { questionId, answer } = req.body;
    const trimmedAnswer = typeof answer === "string" ? answer.trim() : "";

    if (!questionId) {
        throw new ExpressError(400, "questionId is required!");
    }

    const question = await questionsModel.findById(questionId);
    if (!question) {
        throw new ExpressError(404, "Question not found");
    }
    if (question.subtype !== 'write_email') {
        throw new ExpressError(401, "this is not valid questionType for this route!");
    }

    if (!trimmedAnswer) {
        const zeroResult = {
            score: 0,
            content: 0,
            grammar: 0,
            spelling: 0,
            form: 0,
            organization: 0,
            emailConvention: 0,
            vocabularyRange: 0,
            wordCount: 0,
            noFurtherScoring: true,
            gatingReason: "content",
            feedback: "No response was provided, so the content score is 0 and no further scoring is applied.",
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
            ...zeroResult,
            assessment: buildWriteEmailAssessment(zeroResult),
        });
    }

    const originalEmailTemplate = question.prompt;

    const prompt = `
You are an expert assessor for PTE Core Write Email responses.

Original Email Task:
${originalEmailTemplate}

User's Email:
${trimmedAnswer}

Evaluate the user's email and provide a score out of 15 in the following categories:
- Content (0-3)
- Email Conventions (0-2)
- Form (0-2)
- Organization (0-2)
- Vocabulary (0-2)
- Grammar (0-2)
- Spelling (0-2)

Score Content first.
Only if Content > 0 should you score Form.
Only if both Content > 0 and Form > 0 should you score Email Conventions, Organization, Vocabulary, Grammar, and Spelling.
Responses that contain significant amounts of pre-prepared or memorized material should receive Content = 0.
Use these exact rubric bands:
- Content:
  - 3: Addresses the requirements of the task sufficiently and appropriately.
  - 2: Addresses the task with some success and demonstrates some understanding of the task.
  - 1: Attempts to address the task but is not successful; the task and/or topics may have been misunderstood.
  - 0: Does not properly deal with the task; the task and/or topics may have been largely misunderstood.
- Email Conventions:
  - 2: Email conventions are obvious, appropriate, and used correctly in keeping with the format of the task.
  - 1: Email conventions are used inconsistently with elements missing and/or used ineffectively.
  - 0: Email conventions are limited or missing.
- Form:
  - 2: Contains 50-120 words.
  - 1: Contains 30-49 words or 121-140 words.
  - 0: Contains fewer than 30 words or more than 140 words.
- Organization:
  - 2: Organizational structure is clear and easy to follow. Ideas are presented logically and clearly organized. Transitions are used effectively to guide the reader through the email.
  - 1: Organizational structure is generally acceptable and somewhat clear. Themes and their related ideas are organized together but their relationship to the rest of the email may be unclear at points. Transitions are adequate but mostly basic or simple.
  - 0: Organizational structure is missing or not appropriate. Some ideas may connect to each other but some or all connections are unclear. Transitions may be present but may not be useful.
- Vocabulary:
  - 2: Good command of lexis appropriate to the context of the given situation.
  - 1: Limited range of lexis. Some lexis is appropriate to the context, but lexical shortcomings lead to some imprecision.
  - 0: Contains mainly basic vocabulary insufficient to deal with the context of the given situation.
- Grammar:
  - 2: Generally consistent grammatical control with only occasional errors.
  - 1: Fair degree of grammatical control; errors may be evident but do not cause the reader undue effort.
  - 0: Contains mainly simple structures and/or frequent mistakes.
- Spelling:
  - 2: Contains a maximum of two spelling/typing errors.
  - 1: Contains three or four spelling/typing errors.
  - 0: Contains numerous spelling/typing errors that may cause undue effort on the part of the reader.
- If the response has fewer than 30 words or more than 140 words, Form must be 0 and the overall Score must be 0.
- If Content = 0 or Form = 0, the overall Score must be 0.
- If Content = 0, return 0 for all remaining traits because there is no further scoring.
- If Form = 0, return 0 for Email Conventions, Organization, Vocabulary, Grammar, and Spelling because there is no further scoring.

Return the result in exactly this format and nothing else:

Score: X/15
Enabling Skills:
Content: X/3
Grammar: X/2
Spelling: X/2
Form: X/2
Organization: X/2
Email Conventions: X/2
Vocabulary: X/2

Feedback: Your feedback goes here
`;

    function parseGPTResponseForWriteEmail(responseText) {
        const regex = /Score:\s*(\d+(\.\d+)?)\/15\s*Enabling Skills:\s*Content:\s*(\d+)\/3\s*Grammar:\s*(\d+)\/2\s*Spelling:\s*(\d+)\/2\s*Form:\s*(\d+)\/2\s*Organization:\s*(\d+)\/2\s*Email Conventions?:\s*(\d+)\/2\s*Vocabulary(?: Range)?:\s*(\d+)\/2\s*Feedback:\s*([\s\S]+)/i;

        const matches = regex.exec(responseText);

        if (!matches) {
            throw new Error('Unable to parse GPT response');
        }

        return {
            score: parseFloat(matches[1]),
            content: parseInt(matches[3]),
            grammar: parseInt(matches[4]),
            spelling: parseInt(matches[5]),
            form: parseFloat(matches[6]),
            organization: parseInt(matches[7]),
            emailConvention: parseInt(matches[8]),
            vocabularyRange: parseInt(matches[9]),
            feedback: matches[10].trim()
        };
    }

    const gptResponse = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            {
                role: "system",
                content: "You are an expert assessor for PTE Core write email responses."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        max_tokens: 500,
        temperature: 0.7,
    });

    const gptResult = gptResponse.choices[0].message.content;
    const parsedResult = enforceWriteEmailScore(
        parseGPTResponseForWriteEmail(gptResult),
        trimmedAnswer
    );

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
        ...parsedResult,
        assessment: buildWriteEmailAssessment(parsedResult),
    });
});
