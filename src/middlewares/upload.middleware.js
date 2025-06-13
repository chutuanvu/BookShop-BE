const multer = require('multer');
const path = require('path');
const uploadConfig = require('../config/upload');
const { getFileType } = require('../utils/file.utils');

/**
 * Configure multer storage
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const fileType = getFileType(file.mimetype);
        let uploadPath;

        // Set destination based on file type
        switch (fileType) {
            case 'video':
                uploadPath = path.join(__dirname, '..', uploadConfig.videoDir);
                break;
            case 'image':
                uploadPath = path.join(__dirname, '..', uploadConfig.imageDir);
                break;
            case 'document':
                uploadPath = path.join(__dirname, '..', uploadConfig.documentDir);
                break;
            default:
                return cb(new Error('Unsupported file type'), false);
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    },
});

/**
 * File filter to check if the file type is allowed
 */
const fileFilter = function (req, file, cb) {
    const fileType = getFileType(file.mimetype);

    if (!fileType) {
        return cb(new Error('Unsupported file type'), false);
    }

    const extension = path.extname(file.originalname).toLowerCase().substring(1);
    const isValidExtension = uploadConfig.allowedFileTypes[fileType].test(extension);

    if (isValidExtension) {
        cb(null, true);
    } else {
        cb(new Error(`Only ${fileType} files are allowed!`), false);
    }
};

/**
 * Get file size limit based on file type
 */
const getFileSizeLimit = (fileType) => {
    return uploadConfig.fileSizeLimits[fileType] || 5 * 1024 * 1024; // Default 5MB
};

/**
 * Create multer upload instance for specific file types
 */
const createUploader = (fileType) => {
    return multer({
        storage: storage,
        limits: { fileSize: getFileSizeLimit(fileType) },
        fileFilter: fileFilter,
    });
};

// Create upload middleware instances for different file types
const videoUpload = createUploader('video');
const imageUpload = createUploader('image');
const documentUpload = createUploader('document');

/**
 * Generic upload middleware that determines file type from the request
 */
const uploadFile = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // Default to largest size (100MB)
    fileFilter: fileFilter,
});

module.exports = {
    videoUpload,
    imageUpload,
    documentUpload,
    uploadFile,
};
