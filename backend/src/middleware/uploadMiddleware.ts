// import { Request, Response, NextFunction } from 'express';
// import multer from 'multer';

// export const uploadMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
//   if (error instanceof multer.MulterError) {
//     switch (error.code) {
//       case 'LIMIT_FILE_SIZE':
//         return res.status(400).json({ 
//           success: false, 
//           error: 'File too large. Maximum size allowed is 5MB.' 
//         });
//       case 'LIMIT_FILE_COUNT':
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Too many files. Maximum 5 files allowed.' 
//         });
//       case 'LIMIT_UNEXPECTED_FILE':
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Unexpected field name.' 
//         });
//       default:
//         return res.status(400).json({ 
//           success: false, 
//           error: `Upload error: ${error.message}` 
//         });
//     }
//   }
  
//   if (error.message.includes('Only')) {
//     return res.status(400).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
  
//   next(error);
// };

// export const validateFileExists = (req: Request, res: Response, next: NextFunction) => {
//   if (!req.file && !req.files) {
//     return res.status(400).json({
//       success: false,
//       error: 'No file uploaded'
//     });
//   }
//   next();
// };