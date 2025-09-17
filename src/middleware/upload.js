const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit per file (increased for PDF catalogs)
    files: 25 // Multiple file upload (max 25 files)
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'text/plain'
    ];

    // Allowed extensions
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp', '.txt'];
    
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;

    if (allowedTypes.includes(mimeType) && allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG, WEBP, TXT'), false);
    }
  }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 25 files are allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name for file upload.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

// Create a specialized uploader for PDF files with larger limit
const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for PDF files
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for catalog uploads'), false);
    }
  }
});

module.exports = upload;
module.exports.pdfUpload = pdfUpload;
module.exports.handleUploadError = handleUploadError;