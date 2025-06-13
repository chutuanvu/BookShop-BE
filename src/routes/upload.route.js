const express = require('express');
const { videoUpload, imageUpload, documentUpload, uploadFile } = require('../middlewares/upload.middleware');
const { uploadVideo, uploadImage, uploadDocument, uploadAny } = require('../controllers/upload.controller');


const router = express.Router();

/**
 * @route   POST /api/upload/video
 * @desc    Upload a video file
 * @access  Public
 */
router.post('/video', videoUpload.single('video'), uploadVideo);

/**
 * @route   POST /api/upload/image
 * @desc    Upload an image file
 * @access  Public
 */
router.post('/image', imageUpload.single('image'), uploadImage);

/**
 * @route   POST /api/upload/document
 * @desc    Upload a document file
 * @access  Public
 */
router.post('/document', documentUpload.single('document'), uploadDocument);

/**
 * @route   POST /api/upload
 * @desc    Upload any supported file type (auto-detect)
 * @access  Public
 */
router.post('/', uploadFile.single('file'), uploadAny);

/**
 * Handle upload errors
 */
router.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'File size is too large. Please upload a smaller file.',
        });
    }

    res.status(400).json({
        success: false,
        message: err.message || 'An error occurred during file upload.',
    });
});

module.exports = router;
