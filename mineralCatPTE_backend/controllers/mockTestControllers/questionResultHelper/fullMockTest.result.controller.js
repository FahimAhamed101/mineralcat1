const questionModel = require('../../../models/questions.model');
const practicedModel = require('../../../models/practiced.model');
const ExpressError = require('../../../utils/ExpressError');
const fsPromises = require('fs').promises;
const {
  buildReadAloudAssessment,
  buildRespondToSituationAssessment,
} = require('../../../common/questionAssessment');
const {
  scoreScriptedSpeech,
  scoreOpenEndedSpeech,
} = require('../../../services/speechace.service');

function normalizeIndexedBlankAnswers(answer) {
  if (Array.isArray(answer)) {
    return answer.reduce((result, item, index) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const normalizedIndex = Number(item.index);
        const selectedAnswer = typeof item.selectedAnswer === 'string'
          ? item.selectedAnswer
          : '';

        if (Number.isFinite(normalizedIndex) && selectedAnswer.trim()) {
          result.push({ index: normalizedIndex, selectedAnswer });
        }

        return result;
      }

      if (typeof item === 'string' && item.trim()) {
        result.push({ index, selectedAnswer: item });
      }

      return result;
    }, []);
  }

  if (answer && typeof answer === 'object') {
    return Object.entries(answer).reduce((result, [index, selectedAnswer]) => {
      const normalizedIndex = Number(index);

      if (
        Number.isFinite(normalizedIndex) &&
        typeof selectedAnswer === 'string' &&
        selectedAnswer.trim()
      ) {
        result.push({ index: normalizedIndex, selectedAnswer });
      }

      return result;
    }, []);
  }

  return [];
}

async function evaluateMcqMultipleResult({ userId, questionId, answer }) {
  const question = await questionModel.findById(questionId).lean();

  if (!question || question.subtype !== 'mcq_multiple') {
    throw new ExpressError(404, "Question Not Found or Invalid Type");
  }

  const correctAnswers = question.correctAnswers;
  const score = answer.filter(a => correctAnswers.includes(a)).length;
  const feedback = `You scored ${score} out of ${correctAnswers.length}.`;

  await practicedModel.findOneAndUpdate(
    { user: userId, questionType: question.type, subtype: question.subtype },
    { $addToSet: { practicedQuestions: question._id } },
    { upsert: true, new: true }
  );

  return {
    score,
    feedback,
    totalCorrectAnswers: correctAnswers.length,
  };
}

// MCQ Single result evaluator
async function evaluateMcqSingleResult({ userId, questionId, answer }) {
  
  const question = await questionModel.findById(questionId).lean();
  if (!question || question.subtype !== 'mcq_single') {
    throw new ExpressError(404, "Question not found or invalid type");
  }
  
  const isCorrect = question.correctAnswers.includes(answer);

  await practicedModel.findOneAndUpdate(
    { user: userId, questionType: question.type, subtype: question.subtype },
    { $addToSet: { practicedQuestions: question._id } },
    { upsert: true, new: true }
  );
  const score = isCorrect ? 1 : 0;

  return {
    isCorrect,
    message: isCorrect ? "Correct answer!" : "Incorrect answer!",
    score,
    totalCorrectAnswers: 1,
  };
}

// Reading Fill in the Blanks result evaluator
async function evaluateReadingFillInTheBlanksResult({ userId, questionId, blanks }) {
  const question = await questionModel.findById(questionId).lean();
  const validSubtypes = ['reading_fill_in_the_blanks', 'rw_fill_in_the_blanks'];
  if (!question || !validSubtypes.includes(question.subtype)) {
    throw new ExpressError(404, "Question Not Found!");
  }

  let score = 0;
  const totalBlanks = question.blanks.length;
  const normalizedBlanks = normalizeIndexedBlankAnswers(blanks);

  normalizedBlanks.forEach(userBlank => {
    const correctBlank = question.blanks.find(blank => blank.index === userBlank.index);
    if (correctBlank && userBlank.selectedAnswer === correctBlank.correctAnswer) {
      score++;
    }
  });

  const feedback = `You scored ${score} out of ${totalBlanks}.`;

  await practicedModel.findOneAndUpdate(
    { user: userId, questionType: question.type, subtype: question.subtype },
    { $addToSet: { practicedQuestions: question._id } },
    { upsert: true, new: true }
  );

  return { result: { score, totalBlanks }, feedback };
}

// Reorder Paragraphs result evaluator
async function evaluateReorderParagraphsResult({ userId, questionId, answer }) {
  const question = await questionModel.findById(questionId).lean();
  if (!question || question.subtype !== 'reorder_paragraphs') {
    throw new ExpressError(404, "Question not found or invalid type");
  }

  console.log(answer);
  
  const correctAnswers = question.options;
  let score = 0;

  answer.forEach((userAnswer, index) => {
    if (userAnswer === correctAnswers[index]) {
      score++;
    }
  });

  const totalScore = score;

  await practicedModel.findOneAndUpdate(
    { user: userId, questionType: question.type, subtype: question.subtype },
    { $addToSet: { practicedQuestions: question._id } },
    { upsert: true, new: true }
  );

  return {
    score: totalScore,
    message: `You scored ${score} out of ${correctAnswers.length} points.`,
    userAnswer: answer,
    correctAnswer: correctAnswers,
    totalCorrectAnswers: correctAnswers.length,
  };
}


// reading mcqsingle 
// async function evaluateMcqSingleResult({ userId, questionId, userAnswer }) {
//   const question = await questionModel.findById(questionId).lean();

//   if (!question || question.subtype !== 'mcq_single') {
//     throw new ExpressError(404, "Question not found or invalid type");
//   }

//   const isCorrect = question.correctAnswers.includes(userAnswer);
//   const score = isCorrect ? 1 : 0;

//   await practicedModel.findOneAndUpdate(
//     {
//       user: userId,
//       questionType: question.type,
//       subtype: question.subtype
//     },
//     {
//       $addToSet: { practicedQuestions: question._id }
//     },
//     { upsert: true, new: true }
//   );

//   return {
//     isCorrect,
//     score,
//     message: isCorrect ? "Correct answer!" : "Incorrect answer!"
//   };
// }

// speaking ----------------------------------------------------------------------
// ===============================================================================
async function safeDeleteFile(filePath) {
  if (filePath) {
    try {
      await fsPromises.unlink(filePath);
    } catch (err) {
      console.error("Failed to delete temp file:", err);
    }
  }
}

function toNumber(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function average(values) {
  const nums = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (nums.length === 0) return 0;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getExpectedWordCount(text = '') {
  return String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function getWordQualityScore(wordScore) {
  return toNumber(wordScore?.quality_score ?? wordScore?.word_score, 0);
}

function buildWordCounts(wordScoreList = [], goodMin = 90, averageMin = 60) {
  let goodWords = 0;
  let averageWords = 0;
  let badWords = 0;

  wordScoreList.forEach((wordScore) => {
    const score = getWordQualityScore(wordScore);
    if (score >= goodMin) {
      goodWords += 1;
    } else if (score >= averageMin) {
      averageWords += 1;
    } else {
      badWords += 1;
    }
  });

  return { goodWords, averageWords, badWords };
}

function getFirstNumericValue(...values) {
  for (const value of values) {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return null;
}

function toFivePointTraitScore(rawScore) {
  const numericRawScore = Number(rawScore);

  if (!Number.isFinite(numericRawScore)) {
    return null;
  }

  if (numericRawScore <= 0) {
    return 0;
  }

  if (numericRawScore <= 5) {
    return clamp(Math.round(numericRawScore), 0, 5);
  }

  if (numericRawScore <= 9) {
    return clamp(Math.round((numericRawScore / 9) * 5), 0, 5);
  }

  if (numericRawScore <= 90) {
    return clamp(Math.round(((numericRawScore - 10) / 80) * 5), 0, 5);
  }

  return clamp(Math.round((numericRawScore / 100) * 5), 0, 5);
}

function mapScriptedSpeechResponse(fullResponse, expectedText, goodWordMin = 90) {
  const textScore = fullResponse?.text_score || {};
  const pteScore = textScore?.pte_score || {};
  const fluencyMetrics = textScore?.fluency?.overall_metrics || {};
  const wordScoreList = Array.isArray(textScore?.word_score_list)
    ? textScore.word_score_list
    : [];

  const totalWords = toNumber(
    fluencyMetrics.word_count,
    getExpectedWordCount(expectedText)
  );
  const correctWords = toNumber(fluencyMetrics.correct_word_count, 0);
  const readingAccuracy = totalWords > 0
    ? Math.round((correctWords / totalWords) * 100)
    : 0;

  const pronunciation = toNumber(
    pteScore.pronunciation,
    average(wordScoreList.map(getWordQualityScore))
  );
  const fluency = toNumber(pteScore.fluency, 0);
  const speakingScore = Math.round(average([pronunciation, fluency]));

  return {
    speakingScore,
    readingScore: readingAccuracy,
    content: readingAccuracy,
    fluency,
    pronunciation,
    totalWords,
    ...buildWordCounts(wordScoreList, goodWordMin),
  };
}

function mapOpenEndedSpeechResponse(fullResponse) {
  const speechScore = fullResponse?.speech_score || {};
  const pteScore = speechScore?.pte_score || {};
  const wordScoreList = Array.isArray(speechScore?.word_score_list)
    ? speechScore.word_score_list
    : [];
  const relevanceClass = speechScore?.relevance?.class;
  const predictedText = String(speechScore?.transcript || '').trim();
  const hasTranscript = predictedText.length > 0 || wordScoreList.length > 0;

  const pronunciation = hasTranscript
    ? toFivePointTraitScore(
        getFirstNumericValue(
          speechScore?.pronunciation?.score,
          speechScore?.pronunciation?.overall_score,
          pteScore.pronunciation,
          average(wordScoreList.map(getWordQualityScore))
        )
      ) ?? 0
    : 0;
  const fluency = hasTranscript
    ? toFivePointTraitScore(
        getFirstNumericValue(
          speechScore?.fluency?.score,
          speechScore?.fluency?.overall_score,
          pteScore.fluency
        )
      ) ?? 0
    : 0;

  let appropriacy = 0;
  if (hasTranscript) {
    const numericAppropriacy = getFirstNumericValue(
      speechScore?.relevance?.score,
      speechScore?.relevance?.overall_score,
      speechScore?.relevance?.relevance_score,
      speechScore?.relevance?.band,
      speechScore?.relevance?.band_score,
      speechScore?.ielts_feedback?.task_response?.score,
      speechScore?.ielts_feedback?.task_response?.band,
      pteScore.coherence
    );

    if (numericAppropriacy !== null) {
      appropriacy = toFivePointTraitScore(numericAppropriacy) ?? 0;
    } else {
      const normalizedRelevanceClass = String(relevanceClass || '')
        .trim()
        .toUpperCase();

      if (normalizedRelevanceClass === 'TRUE') {
        appropriacy = 5;
      } else if (
        normalizedRelevanceClass === 'PARTIAL' ||
        normalizedRelevanceClass === 'PARTIALLY_RELEVANT'
      ) {
        appropriacy = 3;
      } else if (normalizedRelevanceClass === 'FALSE') {
        appropriacy = 0;
      } else {
        appropriacy = toFivePointTraitScore(pteScore.coherence) ?? 0;
      }
    }
  }

  const totalTraitScore = pronunciation + fluency + appropriacy;
  const taskScore = Math.round((totalTraitScore / 15) * 100);
  const speakingScore = Math.round(
    toNumber(
      pteScore.overall,
      average([
        pteScore.pronunciation,
        pteScore.fluency,
        pteScore.grammar,
        pteScore.coherence,
        pteScore.vocab,
      ])
    )
  );

  return {
    speakingScore,
    taskScore,
    readingScore: 0,
    content: appropriacy,
    appropriacy,
    fluency,
    pronunciation,
    totalTraitScore,
    traitScaleMax: 5,
    predictedText,
    relevanceClass: relevanceClass || null,
    totalWords: wordScoreList.length,
    ...buildWordCounts(wordScoreList),
  };
}

async function savePractice(userId, question) {
  await practicedModel.findOneAndUpdate(
    {
      user: userId,
      questionType: question.type,
      subtype: question.subtype
    },
    {
      $addToSet: { practicedQuestions: question._id }
    },
    { upsert: true, new: true }
  );
}

async function handleSpeechAssessment(req, res, expectedSubtype) {
  const { questionId, accent = 'us' } = req.body;
  let userFilePath = req.file?.path;

  try {
    if (!questionId) throw new ExpressError(400, "questionId is required!");
    if (!req.file) throw new ExpressError(400, "voice is required!");

    const question = await questionModel.findById(questionId);
    if (!question) throw new ExpressError(404, "Question not found!");

    if (question.subtype !== expectedSubtype) {
      throw new ExpressError(401, "This is not a valid questionType for this route!");
    }

    let responseData;
    if (expectedSubtype === 'respond_to_situation') {
      const fullResponse = await scoreOpenEndedSpeech({
        audioFilePath: userFilePath,
        relevanceContext: question.prompt,
        accent,
      });
      responseData = mapOpenEndedSpeechResponse(fullResponse);
    } else {
      const expectedText = question.prompt;
      const fullResponse = await scoreScriptedSpeech({
        audioFilePath: userFilePath,
        expectedText,
        accent,
      });
      responseData = mapScriptedSpeechResponse(fullResponse, expectedText);
    }

    await safeDeleteFile(userFilePath);
    userFilePath = null;

    await savePractice(req.user._id, question);

    const assessment = expectedSubtype === 'respond_to_situation'
      ? buildRespondToSituationAssessment(responseData)
      : buildReadAloudAssessment(responseData);

    return res.status(200).json({
      success: true,
      data: responseData,
      assessment,
    });

  } catch (error) {
    await safeDeleteFile(userFilePath);
    throw error;
  }
}

async function speakingReadAloudResult({ req, res }) {
  return handleSpeechAssessment(req, res, 'read_aloud');
};


async function speakingevaluateRepeatSentenceResult({ userId, questionId, userFilePath, accent = 'us' }) {
  if (!questionId) throw new ExpressError(400, "questionId is required!");
  if (!userFilePath) throw new ExpressError(400, "voice file path is required!");

  const question = await questionModel.findById(questionId);
  if (!question) throw new ExpressError(404, "Question Not Found!");

  const expectedText = question.audioConvertedText;

  let finalResponse;
  try {
    finalResponse = await scoreScriptedSpeech({
      audioFilePath: userFilePath,
      expectedText,
      accent,
    });
  } finally {
    await safeDeleteFile(userFilePath);
  }

  await savePractice(userId, question);

  const mappedResponse = mapScriptedSpeechResponse(finalResponse, expectedText, 85);
  const contentRelevance = Number((mappedResponse.readingScore / 100).toFixed(2));
  const listeningScore = mappedResponse.readingScore;

  return {
    speakingScore: mappedResponse.speakingScore,
    listeningScore,
    content: contentRelevance,
    fluency: mappedResponse.fluency,
    pronunciation: mappedResponse.pronunciation,
    predictedText: "",
    totalWords: mappedResponse.totalWords,
    goodWords: mappedResponse.goodWords,
    averageWords: mappedResponse.averageWords,
    badWords: mappedResponse.badWords
  };
}



async function speakingrespondToASituationResult({ req, res }) {

  return handleSpeechAssessment(req, res, 'respond_to_situation');
};


module.exports = {
  evaluateMcqMultipleResult,
  evaluateReadingFillInTheBlanksResult,
  evaluateReorderParagraphsResult,
  evaluateMcqSingleResult,
  speakingReadAloudResult,
  speakingevaluateRepeatSentenceResult,
  speakingrespondToASituationResult
};
