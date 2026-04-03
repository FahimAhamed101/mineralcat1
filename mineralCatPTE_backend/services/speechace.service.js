const fs = require('node:fs');
const path = require('node:path');
const FormData = require('form-data');
const { default: axios } = require('axios');
const ExpressError = require('../utils/ExpressError');

const SPEECHACE_BASE_URL = process.env.SPEECHACE_BASE_URL || 'https://api.speechace.co';

function getSpeechAceApiKey() {
  const apiKey = process.env.SPEECHACE_API_KEY;
  if (!apiKey) {
    throw new ExpressError(500, 'SPEECHACE_API_KEY is not configured');
  }
  return apiKey;
}

function getDialectFromAccent(accent = 'us') {
  const normalizedAccent = String(accent).trim().toLowerCase();

  if (['gb', 'uk', 'en-gb', 'british'].includes(normalizedAccent)) {
    return 'en-gb';
  }

  return 'en-us';
}

function getAudioMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.wav') return 'audio/wav';
  if (ext === '.m4a') return 'audio/mp4';
  if (ext === '.ogg') return 'audio/ogg';
  if (ext === '.webm') return 'audio/webm';
  if (ext === '.aiff' || ext === '.aif') return 'audio/aiff';

  return 'audio/mpeg';
}

async function scoreScriptedSpeech({ audioFilePath, expectedText, accent = 'us' }) {
  if (!audioFilePath) throw new ExpressError(400, 'Audio file path is required');
  if (!expectedText) throw new ExpressError(400, 'Expected text is required');

  const form = new FormData();
  form.append('text', expectedText);
  form.append('include_fluency', '1');
  form.append('user_audio_file', fs.createReadStream(audioFilePath), {
    filename: path.basename(audioFilePath),
    contentType: getAudioMimeType(audioFilePath),
  });

  const requestUrl =
    `${SPEECHACE_BASE_URL}/api/scoring/text/v9/json` +
    `?key=${getSpeechAceApiKey()}` +
    `&dialect=${encodeURIComponent(getDialectFromAccent(accent))}`;

  try {
    const response = await axios.post(requestUrl, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });

    if (response.data?.status && response.data.status !== 'success') {
      throw new ExpressError(500, JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data
      ? JSON.stringify(error.response.data)
      : error.message;

    throw new ExpressError(500, `SpeechAce scripted speech scoring failed: ${errorMessage}`);
  }
}

async function scoreOpenEndedSpeech({ audioFilePath, relevanceContext, accent = 'us' }) {
  if (!audioFilePath) throw new ExpressError(400, 'Audio file path is required');

  const form = new FormData();
  form.append('include_ielts_feedback', '1');
  if (relevanceContext) {
    form.append('relevance_context', relevanceContext);
  }
  form.append('user_audio_file', fs.createReadStream(audioFilePath), {
    filename: path.basename(audioFilePath),
    contentType: getAudioMimeType(audioFilePath),
  });

  const requestUrl =
    `${SPEECHACE_BASE_URL}/api/scoring/speech/v9/json` +
    `?key=${getSpeechAceApiKey()}` +
    `&dialect=${encodeURIComponent(getDialectFromAccent(accent))}`;

  try {
    const response = await axios.post(requestUrl, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });

    if (response.data?.status && response.data.status !== 'success') {
      throw new ExpressError(500, JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data
      ? JSON.stringify(error.response.data)
      : error.message;

    throw new ExpressError(500, `SpeechAce open-ended speech scoring failed: ${errorMessage}`);
  }
}

module.exports = {
  scoreScriptedSpeech,
  scoreOpenEndedSpeech,
};
