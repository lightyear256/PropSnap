"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '../../.env'),
});
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'uploads/properties',
        allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fileName = file.fieldname + '-' + uniqueSuffix;
            return fileName;
        },
        transformation: [
            { width: 1500, height: 1500, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
        ]
    }
});
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
exports.uploadImage = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter
});
// export const uploadImageManual = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: imageFilter
// });
// export const uploadToCloudinary = async (file: Express.Multer.File): Promise<any> => {
//   try {
//     const b64 = Buffer.from(file.buffer).toString('base64');
//     const dataURI = `data:${file.mimetype};base64,${b64}`;
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const fileName = file.fieldname + '-' + uniqueSuffix;
//     const result = await cloudinary.uploader.upload(dataURI, {
//       folder: 'uploads/properties',
//       public_id: fileName,
//       resource_type: 'auto',
//       transformation: [
//         { width: 1500, height: 1500, crop: 'limit' },
//         { quality: 'auto' },
//         { fetch_format: 'auto' }
//       ]
//     });
//     return result;
//   } catch (error) {
//     throw new Error(`Cloudinary upload failed: ${error}`);
//   }
// };
// export const uploadImageEnhanced = multer({
//   storage: new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//       folder: (req: Request, file: Express.Multer.File) => {
//         return `uploads/properties/${req.body.propertyType || 'general'}`;
//       },
//       allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
//       public_id: (req: Request, file: Express.Multer.File): string => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const propertyId = req.body.propertyId || 'unknown';
//         return `${file.fieldname}-${propertyId}-${uniqueSuffix}`;
//       },
//       transformation: [
//         { width: 1500, height: 1500, crop: 'limit' },
//         { quality: 'auto:good' },
//         { fetch_format: 'auto' }
//       ],
//       tags: (req: Request, file: Express.Multer.File) => {
//         return ['property', 'upload', req.body.propertyType || 'general'];
//       }
//     } as any
//   }),
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: imageFilter
// });
// export const deleteCloudinaryImage = async (publicId: string): Promise<any> => {
//   try {
//     const result = await cloudinary.uploader.destroy(publicId);
//     return result;
//   } catch (error) {
//     throw new Error(`Failed to delete image: ${error}`);
//   }
// };
// export const deleteMultipleCloudinaryImages = async (publicIds: string[]): Promise<any> => {
//   try {
//     const result = await cloudinary.api.delete_resources(publicIds);
//     return result;
//   } catch (error) {
//     throw new Error(`Failed to delete images: ${error}`);
//   }
// };
// export const getOptimizedImageUrl = (publicId: string, options: any = {}): string => {
//   const defaultTransformation = {
//     quality: 'auto',
//     fetch_format: 'auto',
//     ...options
//   };
//   return cloudinary.url(publicId, { transformation: defaultTransformation });
// };
