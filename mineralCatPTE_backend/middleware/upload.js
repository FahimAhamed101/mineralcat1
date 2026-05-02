const multer = require('multer');
const path = require('path');

const DEFAULT_FILE_SIZE_LIMIT = 25 * 1024 * 1024; // 25MB

const MIME_TYPE_EXTENSION_MAP = {
    'audio/mpeg': '.mp3',
    'audio/mp3': '.mp3',
    'audio/wav': '.wav',
    'audio/x-wav': '.wav',
    'audio/webm': '.webm',
    'audio/ogg': '.ogg',
    'audio/mp4': '.m4a',
    'audio/x-m4a': '.m4a',
    'video/webm': '.webm',
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

/**
 * Returns a multer middleware configured to accept only specific file extensions.
 * @param {string[]} allowedExtensions - e.g. ['.jpg', '.png', '.pdf']
 * @param {{ fileSize?: number }} options
 */
const createUploadMiddleware = (allowedExtensions, options = {}) => {
    return multer({
        storage,
        limits: { fileSize: options.fileSize || DEFAULT_FILE_SIZE_LIMIT },
        fileFilter: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const normalizedMimeExtension = MIME_TYPE_EXTENSION_MAP[String(file.mimetype || '').toLowerCase()];

            if (allowedExtensions.includes(ext) || (normalizedMimeExtension && allowedExtensions.includes(normalizedMimeExtension))) {
                cb(null, true);
            } else {
                const error = new Error(`Only ${allowedExtensions.join(', ')} files are allowed!`);
                error.status = 400;
                cb(error);
            }
        }
    });
};

module.exports = createUploadMiddleware;
