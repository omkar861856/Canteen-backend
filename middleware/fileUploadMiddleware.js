import express from 'express';
import multer, { diskStorage, MulterError } from 'multer';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Create directories for storing files
const imageDir = 'uploads/images';
const audioDir = 'uploads/audio';

// Ensure directories exist
[imageDir, audioDir].forEach((dir) => {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
});

// Storage configuration for images
const imageStorage = diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

// Storage configuration for audio
const audioStorage = diskStorage({
    destination: (req, file, cb) => {
        cb(null, audioDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extName = allowedTypes.test(extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

// File filter for audio
const audioFileFilter = (req, file, cb) => {
    const allowedTypes = /mp3|wav|ogg/;
    const extName = allowedTypes.test(extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
        cb(null, true);
    } else {
        cb(new Error('Only audio files are allowed!'));
    }
};

// Multer configuration for handling both file types
export const upload = multer({
    storage: diskStorage({
        destination: (req, file, cb) => {
            if (file.fieldname === 'imageFile') cb(null, imageDir);
            else if (file.fieldname === 'audioFile') cb(null, audioDir);
        },
        filename: (req, file, cb) => {
            const uniqueName = `${Date.now()}-${file.originalname}`;
            cb(null, uniqueName);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'imageFile') {
            return imageFileFilter(req, file, cb);
        } else if (file.fieldname === 'audioFile') {
            return audioFileFilter(req, file, cb);
        } else {
            cb(new Error('Unexpected file field name'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB per file
});

// Initialize Express app
const app = express();

// Route to handle image and audio file uploads
app.post('/upload', upload.fields([
    { name: 'imageFile', maxCount: 1 },
    { name: 'audioFile', maxCount: 1 },
]), (req, res) => {
    if (!req.files || (!req.files.imageFile && !req.files.audioFile)) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const response = {};
    if (req.files.imageFile) {
        response.imageFilePath = req.files.imageFile[0].path;
    }
    if (req.files.audioFile) {
        response.audioFilePath = req.files.audioFile[0].path;
    }

    res.status(200).json({
        message: 'Files uploaded successfully',
        files: response,
    });
});

// Global error handler for Multer
app.use((err, req, res, next) => {
    if (err instanceof MulterError) {
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

// Start the server
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });