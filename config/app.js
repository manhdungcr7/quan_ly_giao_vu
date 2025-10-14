const path = require('path');
// Always resolve .env relative to project root (one level up from this config dir)
const envPath = path.resolve(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

// Diagnostic: warn if critical vars missing (helps when running from wrong CWD)
const requiredEnv = ['DB_HOST','DB_NAME','DB_USER'];
const missing = requiredEnv.filter(k => !process.env[k]);
if (missing.length) {
    console.warn('⚠️  Missing env vars:', missing.join(', '), ' (loaded .env from:', envPath, ')');
}
if (!process.env.DB_PASSWORD) {
    console.warn('⚠️  DB_PASSWORD is empty or not set. If this is unexpected, check .env file at', envPath);
}

// Application configuration
const config = {
    // Server configuration
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development',
    sslEnabled: false
    },

    // Database configuration
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'quan_ly_giao_vu'
    },

    // Session configuration
    session: {
        secret: process.env.SESSION_SECRET || 'quan_ly_giao_vu_secret_key',
        name: process.env.SESSION_NAME || 'quan_ly_giao_vu_session',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    },

    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'jwt_secret_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },

    // File upload configuration
    upload: (() => {
        const rawPath = process.env.UPLOAD_PATH || './public/uploads';
        const absolutePath = path.isAbsolute(rawPath) ? rawPath : path.resolve(__dirname, '..', rawPath);
        return {
            maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 50 * 1024 * 1024, // default 50MB if not set
            uploadPath: absolutePath,
            // Danh sách MIME types mở rộng (cần song song với kiểm tra extension phía dưới)
            allowedTypes: [
                'image/jpeg','image/png','image/gif','image/webp','image/svg+xml',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain',
                'application/zip', 'application/x-zip-compressed',
                'application/x-rar-compressed',
                'application/x-7z-compressed'
            ]
        };
    })(),

    // Application settings
    app: {
        name: process.env.APP_NAME || 'quản lý giáo vụ Khoa',
        url: process.env.APP_URL || 'http://localhost:3000',
        timezone: process.env.TIMEZONE || 'Asia/Ho_Chi_Minh'
    },

    // Pagination settings
    pagination: {
        defaultLimit: 20,
        maxLimit: 100
    },

    // Security settings
    security: {
        bcryptRounds: 12,
        rateLimitWindow: 15 * 60 * 1000, // 15 minutes
        rateLimitMax: 100 // requests per window
    }
};

module.exports = config;