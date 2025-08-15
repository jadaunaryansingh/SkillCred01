"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePDFProcessing = exports.handlePDFUpload = void 0;
const multer_1 = __importDefault(require("multer"));
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});
exports.handlePDFUpload = upload.single('pdf');
const handlePDFProcessing = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No PDF file uploaded",
                message: "Please upload a valid PDF file"
            });
        }
        console.log('Processing PDF file:', req.file.originalname, 'Size:', req.file.size);
        // For now, return a helpful message directing users to use client-side processing
        // The pdf-parse library has issues with test file dependencies
        const message = `PDF file "${req.file.originalname}" received. Due to server-side PDF processing limitations, the client-side PDF processor will handle the text extraction automatically.`;
        return res.json({
            success: false,
            error: "Server-side PDF processing temporarily unavailable",
            message: message
        });
    }
    catch (error) {
        console.error('Error processing PDF:', error);
        return res.status(500).json({
            success: false,
            error: "PDF processing error",
            message: "Please try uploading the file again or use the text input instead."
        });
    }
};
exports.handlePDFProcessing = handlePDFProcessing;
