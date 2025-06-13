const fs = require('fs');
const path = require('path');

/**
 * Create a directory if it doesn't exist
 * @param {string} dirPath - Path to the directory
 */
const createDirectory = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/**
 * Initialize upload directories
 * @param {Object} config - Server configuration
 */
const initializeUploadDirs = (config) => {
    const baseDir = path.join(__dirname, '..');

    // Create main uploads directory
    const uploadsDir = path.join(baseDir, config.uploadsDir);
    createDirectory(uploadsDir);

    // Create specific upload directories
    createDirectory(path.join(baseDir, config.videoDir));
    createDirectory(path.join(baseDir, config.imageDir));
    createDirectory(path.join(baseDir, config.documentDir));

    console.log('✅ Upload directories initialized');
};

/**
 * Determine file type based on mimetype
 * @param {string} mimetype - File mimetype
 * @returns {string|null} - File type (video, image, document) or null if unknown
 */
const getFileType = (mimetype) => {
    if (mimetype.startsWith('video/')) {
        return 'video';
    } else if (mimetype.startsWith('image/')) {
        return 'image';
    } else if (mimetype.startsWith('application/') || mimetype.startsWith('text/')) {
        return 'document';
    }
    return null;
};

/**
 * Generate a URL for the uploaded file
 * @param {Object} req - Express request object
 * @param {string} filePath - Relative path to the file
 * @returns {string} - Full URL to access the file
 */
const generateFileUrl = (req, filePath) => {
    return `${req.protocol}://${req.get('host')}/${filePath}`;
};

module.exports = {
    createDirectory,
    initializeUploadDirs,
    getFileType,
    generateFileUrl,
};
