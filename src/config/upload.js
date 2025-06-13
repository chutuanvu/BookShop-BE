const uploadConfig = {
    // Upload directories
    uploadsDir: 'uploads',
    videoDir: 'uploads/videos',
    imageDir: 'uploads/images',
    documentDir: 'uploads/documents',

    // File size limits (in bytes)
    fileSizeLimits: {
        video: 100 * 1024 * 1024, // 100MB
        image: 5 * 1024 * 1024, // 5MB
        document: 20 * 1024 * 1024, // 20MB
    },

    // Allowed file types
    allowedFileTypes: {
        video: /mp4|mov|avi|mkv|webm/,
        image: /jpeg|jpg|png|gif|svg|webp/,
        document: /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|json|xml/,
    },
};

module.exports = uploadConfig;
