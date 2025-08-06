"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptimizedImageUrl = exports.deleteMultipleCloudinaryImages = exports.deleteCloudinaryImage = exports.uploadImageEnhanced = exports.uploadToCloudinary = exports.uploadImageManual = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '../../.env'),
});
// Configure Cloudinary (make sure you have these in your .env file)
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// Configure Cloudinary storage (replaces your diskStorage)
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'uploads/properties', // This replaces your 'uploads/properties' destination
        allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'], // Same as your allowed types
        public_id: (req, file) => {
            // This replaces your filename generation logic
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fileName = file.fieldname + '-' + uniqueSuffix;
            return fileName;
        },
        // Optional: Add transformations
        transformation: [
            { width: 1500, height: 1500, crop: 'limit' }, // Auto-resize large images
            { quality: 'auto' }, // Optimize quality automatically
            { fetch_format: 'auto' } // Use best format for each browser
        ]
    } // TypeScript workaround for complex params
});
// Your same image filter logic (now redundant since Cloudinary handles it, but keeping for extra validation)
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'));
    }
};
// Your same export with Cloudinary storage
exports.uploadImage = (0, multer_1.default)({
    storage: storage, // Now uses Cloudinary instead of disk
    limits: { fileSize: 5 * 1024 * 1024 }, // Same 5MB limit
    fileFilter: imageFilter // Same filter logic
});
// Alternative: If you want more control, use memory storage + manual upload
exports.uploadImageManual = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter
});
// Helper function for manual uploads (if you choose the alternative approach)
const uploadToCloudinary = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = file.fieldname + '-' + uniqueSuffix;
        const result = yield cloudinary_1.v2.uploader.upload(dataURI, {
            folder: 'uploads/properties',
            public_id: fileName,
            resource_type: 'auto',
            transformation: [
                { width: 1500, height: 1500, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });
        return result;
    }
    catch (error) {
        throw new Error(`Cloudinary upload failed: ${error}`);
    }
});
exports.uploadToCloudinary = uploadToCloudinary;
// Enhanced version with more Cloudinary features
exports.uploadImageEnhanced = (0, multer_1.default)({
    storage: new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_1.v2,
        params: {
            folder: (req, file) => {
                // Dynamic folder based on request (e.g., user ID, property type, etc.)
                return `uploads/properties/${req.body.propertyType || 'general'}`;
            },
            allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
            public_id: (req, file) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const propertyId = req.body.propertyId || 'unknown';
                return `${file.fieldname}-${propertyId}-${uniqueSuffix}`;
            },
            transformation: [
                { width: 1500, height: 1500, crop: 'limit' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ],
            // Add tags for better organization
            tags: (req, file) => {
                return ['property', 'upload', req.body.propertyType || 'general'];
            }
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter
});
// Utility functions for cleanup (since you won't have local files anymore)
const deleteCloudinaryImage = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.uploader.destroy(publicId);
        return result;
    }
    catch (error) {
        throw new Error(`Failed to delete image: ${error}`);
    }
});
exports.deleteCloudinaryImage = deleteCloudinaryImage;
const deleteMultipleCloudinaryImages = (publicIds) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.api.delete_resources(publicIds);
        return result;
    }
    catch (error) {
        throw new Error(`Failed to delete images: ${error}`);
    }
});
exports.deleteMultipleCloudinaryImages = deleteMultipleCloudinaryImages;
// Get optimized image URLs with transformations
const getOptimizedImageUrl = (publicId, options = {}) => {
    const defaultTransformation = Object.assign({ quality: 'auto', fetch_format: 'auto' }, options);
    return cloudinary_1.v2.url(publicId, { transformation: defaultTransformation });
};
exports.getOptimizedImageUrl = getOptimizedImageUrl;
