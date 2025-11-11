import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import errorHandler from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import internshipRoutes from './routes/internshipRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Disposition'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range']
};
// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Serve static files (uploads) - DEPRECATED, use /api/files/:filename instead
app.use('/uploads', express.static('uploads'));

// File download endpoint with proper streaming
app.get('/api/files/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    console.log('📥 [FILE DOWNLOAD REQUEST]');
    console.log('   Filename:', filename);
    console.log('   Full Path:', filePath);
    console.log('   Request Origin:', req.headers.origin);
    console.log('   User-Agent:', req.headers['user-agent']);
    console.log('   Range Header:', req.headers.range || 'None');

    // Add CORS headers explicitly for file downloads
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length, Content-Disposition');

    console.log('   CORS Origin Set:', process.env.CORS_ORIGIN || 'http://localhost:3000');

    // Security: Prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(path.join(__dirname, 'uploads'))) {
        console.log('❌ [FILE DOWNLOAD] Access denied - Directory traversal attempt');
        console.log('   Normalized Path:', normalizedPath);
        console.log('   Expected Base:', path.join(__dirname, 'uploads'));
        return res.status(403).json({
            success: false,
            message: 'Access denied'
        });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.log('❌ [FILE DOWNLOAD] File not found');
        console.log('   Searched Path:', filePath);
        console.log('   Directory Contents:', fs.existsSync(path.join(__dirname, 'uploads')) 
            ? fs.readdirSync(path.join(__dirname, 'uploads')).slice(0, 5)
            : 'uploads directory does not exist');
        return res.status(404).json({
            success: false,
            message: 'File not found'
        });
    }

    // Get file stats
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    console.log('✅ [FILE DOWNLOAD] File found');
    console.log('   File Size:', fileSize, 'bytes', `(${(fileSize / 1024).toFixed(2)} KB)`);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Accept-Ranges', 'bytes');

    // Handle range requests for partial content (resume downloads)
    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;

        console.log('📦 [FILE DOWNLOAD] Streaming with Range Request');
        console.log('   Range:', `${start}-${end}/${fileSize}`);
        console.log('   Chunk Size:', chunksize, 'bytes');

        res.status(206); // Partial Content
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Content-Length', chunksize);

        const stream = fs.createReadStream(filePath, { start, end });
        
        stream.on('open', () => {
            console.log('✅ [FILE DOWNLOAD] Stream opened successfully');
        });
        
        stream.on('error', (err) => {
            console.error('❌ [FILE DOWNLOAD] Stream error:', err.message);
        });
        
        stream.on('end', () => {
            console.log('✅ [FILE DOWNLOAD] Stream ended - Range request completed');
        });

        stream.pipe(res);
    } else {
        // Stream the entire file
        console.log('📦 [FILE DOWNLOAD] Streaming entire file (no range)');
        console.log('   File Size:', fileSize, 'bytes');

        const stream = fs.createReadStream(filePath);
        
        stream.on('open', () => {
            console.log('✅ [FILE DOWNLOAD] Stream opened successfully');
        });
        
        stream.on('error', (err) => {
            console.error('❌ [FILE DOWNLOAD] Stream error:', err.message);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error streaming file'
                });
            }
        });
        
        stream.on('end', () => {
            console.log('✅ [FILE DOWNLOAD] Stream ended - Full file sent successfully');
        });

        stream.pipe(res);
    }
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/internships', internshipRoutes);

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to SkillSync API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            student: '/api/student',
            company: '/api/company',
            admin: '/api/admin',
            internships: '/api/internships',
        },
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
