const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const ExpressError = require('../utils/ExpressError');

const BUCKET_NAME = 'audioUploads';

function getAudioBucket() {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw new ExpressError(500, 'Database is not connected for audio storage');
  }

  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME });
}

function getPublicBaseUrl(req) {
  if (!req) {
    throw new ExpressError(500, 'Request context is required for audio storage');
  }

  return `${req.protocol}://${req.get('host')}`;
}

function buildStoredAudioUrl(fileId, req) {
  return `${getPublicBaseUrl(req)}/media/audio/${fileId.toString()}`;
}

function getStoredAudioFilename(file, folderName) {
  const originalName = file.originalname || path.basename(file.path);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension)
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'audio';

  return `${folderName || 'audio'}/${baseName}-${Date.now()}${extension}`;
}

async function storeAudioFile(file, folderName, req) {
  if (!file?.path) {
    throw new ExpressError(400, 'Uploaded audio file path is missing');
  }

  const bucket = getAudioBucket();
  const uploadStream = bucket.openUploadStream(
    getStoredAudioFilename(file, folderName),
    {
      contentType: file.mimetype || 'application/octet-stream',
      metadata: {
        folderName,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      },
    }
  );

  return new Promise((resolve, reject) => {
    fs.createReadStream(file.path)
      .on('error', reject)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve(buildStoredAudioUrl(uploadStream.gridFSFile?._id || uploadStream.id, req));
      });
  });
}

function parseRangeHeader(rangeHeader, fileSize) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(rangeHeader || '').trim());
  if (!match) return null;

  let start = match[1] ? Number(match[1]) : 0;
  let end = match[2] ? Number(match[2]) : fileSize - 1;

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return null;
  }

  if (!match[1] && match[2]) {
    const suffixLength = Number(match[2]);
    start = Math.max(fileSize - suffixLength, 0);
    end = fileSize - 1;
  }

  if (start < 0 || end < start || start >= fileSize) {
    return null;
  }

  return {
    start,
    end: Math.min(end, fileSize - 1),
  };
}

async function streamAudioFile(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ExpressError(400, 'Invalid audio file id');
    }

    const objectId = new mongoose.Types.ObjectId(id);
    const bucket = getAudioBucket();
    const file = await bucket.find({ _id: objectId }).next();

    if (!file) {
      throw new ExpressError(404, 'Audio file not found');
    }

    const contentType = file.contentType || file.metadata?.mimetype || 'audio/mpeg';
    const range = parseRangeHeader(req.headers.range, file.length);

    res.set({
      'Accept-Ranges': 'bytes',
      'Content-Type': contentType,
      'Content-Disposition': 'inline',
    });

    if (range) {
      const chunkSize = range.end - range.start + 1;
      res.status(206).set({
        'Content-Range': `bytes ${range.start}-${range.end}/${file.length}`,
        'Content-Length': chunkSize,
      });

      bucket
        .openDownloadStream(objectId, { start: range.start, end: range.end + 1 })
        .on('error', next)
        .pipe(res);
      return;
    }

    res.set('Content-Length', file.length);
    bucket.openDownloadStream(objectId).on('error', next).pipe(res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  storeAudioFile,
  streamAudioFile,
};
