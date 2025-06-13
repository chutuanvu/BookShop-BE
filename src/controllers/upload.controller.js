const { getFileType, generateFileUrl } = require('../utils/file.utils');

/**
 * Handle video file uploads
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadVideo = (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'No video file uploaded.',
        });
    }

    const fileUrl = generateFileUrl(req, `uploads/videos/${req.file.filename}`);

    res.json({
        success: true,
        message: 'Video uploaded successfully!',
        file: {
            originalname: req.file.originalname,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: fileUrl,
        },
    });
};

/**
 * Handle image file uploads
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'No image file uploaded.',
        });
    }

    const fileUrl = generateFileUrl(req, `uploads/images/${req.file.filename}`);

    res.json({
        success: true,
        message: 'Image uploaded successfully!',
        file: {
            originalname: req.file.originalname,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: fileUrl,
        },
    });
};

/**
 * Handle document file uploads
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadDocument = (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'No document file uploaded.',
        });
    }

    const fileUrl = generateFileUrl(req, `uploads/documents/${req.file.filename}`);

    res.json({
        success: true,
        message: 'Document uploaded successfully!',
        file: {
            originalname: req.file.originalname,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: fileUrl,
        },
    });
};

/**
 * Generic file upload handler that detects file type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadAny = (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'No file uploaded.',
        });
    }

    // Determine file type and directory
    const fileType = getFileType(req.file.mimetype);
    let fileDir;

    switch (fileType) {
        case 'video':
            fileDir = 'uploads/videos';
            break;
        case 'image':
            fileDir = 'uploads/images';
            break;
        case 'document':
            fileDir = 'uploads/documents';
            break;
        default:
            return res.status(400).json({
                success: false,
                error: 'Unsupported file type',
            });
    }

    const fileUrl = generateFileUrl(req, `${fileDir}/${req.file.filename}`);

    res.json({
        success: true,
        message: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully!`,
        fileType: fileType,
        file: {
            originalname: req.file.originalname,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: fileUrl,
        },
    });
};

module.exports = {
    uploadVideo,
    uploadImage,
    uploadDocument,
    uploadAny,
};
