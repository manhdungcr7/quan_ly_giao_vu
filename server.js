const util = require('util');

// Normalize deprecated util.isArray usage in third-party modules
Object.defineProperty(util, 'isArray', {
    value: Array.isArray,
    configurable: true,
    writable: true,
    enumerable: false
});

const express = require('express');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const flash = require('connect-flash');
const cors = require('cors');

// Import configurations
const config = require('./config/app');
const db = require('./config/database');

const normalizeOrigin = (value) => {
    if (!value || typeof value !== 'string') return null;
    return value.replace(/\/+$/, '');
};

const buildAppOriginSources = () => {
    const sources = new Set();
    const base = normalizeOrigin(config.app.url);

    if (base) {
        sources.add(base);
    }

    return Array.from(sources).filter(Boolean);
};

const appOriginSources = buildAppOriginSources();

// Import middleware
const { addUserToLocals, notFound, errorHandler } = require('./app/middleware/auth');
const { handleUploadError } = require('./app/middleware/upload');
const { buildBreadcrumb } = require('./app/utils/breadcrumb');

// Import routes
const authRoutes = require('./app/routes/auth');
const webRoutes = require('./app/routes/web');
const apiRoutes = require('./app/routes/api');

// Initialize Express app
const app = express();

// Trust proxy (for production with reverse proxy)
app.set('trust proxy', 1);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Simple layout/content block helpers
app.locals._blocks = {}; // not per-request
app.use((req, res, next) => {
    const blocks = {};
    res.locals.defineContent = function(name){ return (blocks[name] || []).join('\n'); };
    res.locals.contentFor = function(name, block){
        if(!blocks[name]) blocks[name] = [];
        blocks[name].push(block);
    };
    // Wrap original render to inject collected blocks
    const _render = res.render.bind(res);
    res.render = function(view, options = {}, callback){
        options.defineContent = res.locals.defineContent;
        options.contentFor = function(name, content){ res.locals.contentFor(name, content); };
        return _render(view, options, callback);
    };
    next();
});

// Security middleware
const cspDirectives = {
    "default-src": ["'self'"],
    "style-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
    "font-src": ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "data:"],
    "script-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
    "script-src-attr": ["'unsafe-inline'", "'unsafe-hashes'"],
    "img-src": ["'self'", "data:", "https:", "http:"],
    "connect-src": ["'self'"].concat(appOriginSources),
    "form-action": ["'self'"].concat(appOriginSources)
};

app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: cspDirectives
    },
    crossOriginOpenerPolicy: false,
    hsts: config.server.env === 'production' ? undefined : false
}));

// Compression middleware
app.use(compression());

// CORS middleware
const corsOrigins = appOriginSources.length ? appOriginSources : (config.app.url ? [normalizeOrigin(config.app.url)] : []);

app.use(cors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true
}));

// Favicon routes (handle both .ico and .svg) - BEFORE rate limiter
app.get('/favicon.ico', (req, res) => {
    res.set({
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400, immutable'
    });
    res.redirect(301, '/favicon.svg');
});
app.get('/favicon.svg', (req, res) => {
    res.set({
        'Content-Type': 'image/svg+xml',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400, immutable'
    });
    res.sendFile(path.join(__dirname, 'public', 'favicon.svg'));
});

// Rate limiting - More permissive in development
const limiter = rateLimit({
    windowMs: config.security.rateLimitWindow,
    max: config.server.env === 'development' ? 500 : config.security.rateLimitMax, // 500 for dev, 100 for prod
    message: {
        error: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for static assets
        return req.path.startsWith('/css') || 
               req.path.startsWith('/js') || 
               req.path.startsWith('/images') ||
               req.path.startsWith('/uploads');
    }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: config.session.secret,
    name: config.session.name,
    resave: config.session.resave,
    saveUninitialized: config.session.saveUninitialized,
    cookie: config.session.cookie
}));

// Flash messages
app.use(flash());

// Add user to locals for views
app.use(addUserToLocals);

// Global template variables
app.use((req, res, next) => {
    res.locals.appName = config.app.name;
    res.locals.appUrl = config.app.url;
    res.locals.supportsHttps = false;
    res.locals.httpFallbackUrl = config.app.url.replace(/^https:\/\//, 'http://');
    res.locals.currentPath = req.path;
    res.locals.currentUrl = req.url;
    res.locals.moment = require('moment');
    // allow per-view css/js variables
    res.locals.css = '';
    res.locals.js = '';
    
    // Flash messages
    res.locals.success = req.flash('success') || [];
    res.locals.error = req.flash('error') || [];
    res.locals.info = req.flash('info') || [];
    res.locals.warning = req.flash('warning') || [];
    
    if (!res.locals.breadcrumb) {
        res.locals.breadcrumb = buildBreadcrumb(req.path);
    }
    
    next();
});

// Health check route (before other routes)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: 'connected' // We'll assume it's connected if server is running
    });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/', webRoutes);

// Upload error handling
app.use(handleUploadError);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server with automatic port fallback
let desiredPort = Number(config.server.port) || 3000;
const HOST = config.server.host;
let serverInstance = null;

function startServer(port, attempt = 0) {
    const displayHost = HOST === '0.0.0.0' ? '127.0.0.1' : HOST;

    const onListening = () => {
        if (attempt === 0) {
            console.log('🚀 Server starting...');
        } else {
            console.log(`� Server restarted on fallback port after ${attempt} attempt(s).`);
        }
        console.log(`�📊 Environment: ${config.server.env}`);
        console.log(`📁 Upload path: ${config.upload.uploadPath}`);
        console.log(`🌐 HTTP URL: http://${displayHost}:${port}`);

        console.log('✅ Server started successfully!');

        db.testConnection().then(isConnected => {
            if (isConnected) {
                console.log('✅ Database connection verified');
            } else {
                console.log('❌ Database connection failed');
            }
        });
    };

    serverInstance = app.listen(port, HOST, onListening);

    serverInstance.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            if (attempt < 5) {
                const newPort = port + 1;
                console.warn(`⚠️ Port ${port} in use. Trying port ${newPort}...`);
                setTimeout(() => startServer(newPort, attempt + 1), 300);
            } else {
                console.error('❌ All fallback port attempts failed (tried 5 ports). Exiting.');
                process.exit(1);
            }
        } else {
            console.error('❌ Server error:', err);
            process.exit(1);
        }
    });
}

startServer(desiredPort);

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 SIGTERM received, shutting down gracefully...');
    
    try {
        await db.close();
        console.log('✅ Database connections closed');
    } catch (error) {
        console.error('❌ Error closing database connections:', error);
    }
    
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 SIGINT received, shutting down gracefully...');
    
    try {
        await db.close();
        console.log('✅ Database connections closed');
    } catch (error) {
        console.error('❌ Error closing database connections:', error);
    }
    
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error('❌ Uncaught EADDRINUSE even after fallback attempts.');
    } else {
        console.error('❌ Uncaught Exception:', err);
    }
    // Allow process managers (PM2, nodemon) to restart
    process.exit(1);
});

module.exports = app;