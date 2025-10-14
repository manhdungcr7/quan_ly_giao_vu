const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../../config/app');
const CONSTANTS = require('../../config/constants');

// Tạo thư mục upload nếu chưa tồn tại
function ensureUploadDir(uploadPath) {
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }
}

function normalizeOriginalName(originalName) {
    if (!originalName) {
        return '';
    }

    const glitchPattern = /Ã|Â|â€™|â€œ|â€�|â€“|áº|á»/;
    if (!glitchPattern.test(originalName)) {
        return originalName;
    }

    try {
        const decoded = Buffer.from(originalName, 'latin1').toString('utf8');
        return decoded || originalName;
    } catch (error) {
        console.warn('Failed to normalize filename encoding:', {
            originalName,
            message: error.message
        });
        return originalName;
    }
}

function applyNameNormalization(file) {
    if (!file || !file.originalname) {
        return;
    }
    const normalized = normalizeOriginalName(file.originalname);
    if (normalized !== file.originalname) {
        console.log('Normalized upload name:', {
            before: file.originalname,
            after: normalized
        });
        file.originalname = normalized;
    }
}

// Cấu hình storage cho multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = config.upload.uploadPath;
        ensureUploadDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        applyNameNormalization(file);
        // Tạo tên file unique: timestamp_originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${uniqueSuffix}_${name}${ext}`);
    }
});

// Cấu hình storage cho avatar
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(config.upload.uploadPath, 'avatars');
        ensureUploadDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        applyNameNormalization(file);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${uniqueSuffix}${ext}`);
    }
});

// Cấu hình storage cho documents
const documentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(config.upload.uploadPath, 'documents');
        ensureUploadDir(uploadPath);
        console.log('Document upload destination:', uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        applyNameNormalization(file);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        const newFilename = `doc_${uniqueSuffix}_${name}${ext}`;
        console.log('Generated filename:', newFilename, 'for original:', file.originalname);
        cb(null, newFilename);
    }
});

// File filter function
function fileFilter(req, file, cb) {
    applyNameNormalization(file);
    console.log('File filter check:', {
        originalName: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname
    });

    const allowedMimeTypes = config.upload.allowedTypes;
    if (allowedMimeTypes.includes(file.mimetype)) {
        console.log('File accepted:', file.originalname);
        return cb(null, true);
    }
    console.warn('Rejected upload due to MIME type:', {
        originalName: file.originalname,
        mimetype: file.mimetype,
        allowed: allowedMimeTypes
    });
    cb(new Error(CONSTANTS.MESSAGES.ERROR.INVALID_FILE_TYPE), false);
}

// File filter cho ảnh
function imageFilter(req, file, cb) {
    applyNameNormalization(file);
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        return cb(null, true);
    }
    console.warn('Rejected avatar due to MIME type:', file.mimetype);
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)'), false);
}

// Cấu hình multer chung
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: config.upload.maxFileSize,
        files: 10 // Tối đa 10 files
    }
});

// Cấu hình multer cho avatar
const avatarUpload = multer({
    storage: avatarStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB cho avatar
        files: 1
    }
});

// Cấu hình multer cho documents
const documentUpload = multer({
    storage: documentStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: config.upload.maxFileSize,
        files: 5 // Tối đa 5 files cho mỗi document
    }
});

console.log('Document upload configured with max file size:', config.upload.maxFileSize, 'bytes');

// Middleware xử lý lỗi upload
function handleUploadError(error, req, res, next) {
    // Only handle Multer-specific errors here
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: CONSTANTS.MESSAGES.ERROR.FILE_TOO_LARGE
            });
        }
        
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Số lượng file vượt quá giới hạn cho phép'
            });
        }
        
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Field upload không hợp lệ'
            });
        }
    }
    
    // Handle our custom invalid file type error
    if (error && error.message === CONSTANTS.MESSAGES.ERROR.INVALID_FILE_TYPE) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    // If request actually involved file(s) and an error occurred, treat it as upload error
    const hasUpload = Boolean(req.file) || (req.files && (Array.isArray(req.files) ? req.files.length : Object.keys(req.files).length));
    if (hasUpload) {
        console.error('Upload error detail:', {
            message: error?.message,
            stack: error?.stack,
            code: error?.code,
            field: error?.field,
            files: (req.files && (Array.isArray(req.files) ? req.files.length : Object.keys(req.files).length)) || (req.file ? 1 : 0)
        });
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi upload file'
        });
    }

    // Not an upload error: pass to general error handler
    return next(error);
}

// Helper function để xóa file
function deleteFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
}

// Helper function để lấy thông tin file
function getFileInfo(file) {
    return {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        relativePath: file.path.replace(process.cwd(), '').replace(/\\/g, '/')
    };
}

// Middleware để validate file upload trước khi xử lý
function validateFileUpload(req, res, next) {
    if (!req.files && !req.file) {
        return next();
    }
    
    const files = req.files || [req.file];
    
    for (const file of files) {
        // Kiểm tra extension
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedExts = [
            ...CONSTANTS.ALLOWED_FILE_EXTENSIONS.IMAGES,
            ...CONSTANTS.ALLOWED_FILE_EXTENSIONS.DOCUMENTS,
            ...CONSTANTS.ALLOWED_FILE_EXTENSIONS.ARCHIVES
        ];
        
        if (!allowedExts.includes(ext)) {
            // Xóa file đã upload
            deleteFile(file.path);
            return res.status(400).json({
                success: false,
                message: `Loại file ${ext} không được hỗ trợ`
            });
        }

        // Bổ sung cảnh báo nếu MIME và extension không khớp (có thể truy vết tấn công)
        if (!config.upload.allowedTypes.includes(file.mimetype)) {
            console.warn('Mismatch extension vs MIME (possible spoof):', {
                originalName: file.originalname,
                ext,
                mimetype: file.mimetype
            });
        }
    }
    
    next();
}

// Middleware để log upload activity
function logUploadActivity(req, res, next) {
    const originalSend = res.send;
    
    res.send = function(data) {
        // Log successful uploads
        if (res.statusCode < 400 && (req.files || req.file)) {
            const files = req.files || [req.file];
            console.log(`File upload successful: ${files.length} files uploaded by user ${req.session?.user?.id || 'anonymous'}`);
        }
        
        originalSend.call(this, data);
    };
    
    next();
}

module.exports = {
    upload,
    avatarUpload,
    documentUpload,
    handleUploadError,
    validateFileUpload,
    logUploadActivity,
    deleteFile,
    getFileInfo
};