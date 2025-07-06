import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from './CouldinaryConfig';

// ✅ Cloudinary storage
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: 'uploads',
        allowedFormats: ['jpg', 'png', 'jpeg'],
        public_id: `${Date.now()}_${file.originalname}`,
    }),
});

// ✅ Multer instance (เลือก storage ตามโปรเจกต์)
export const upload = multer({
    storage: cloudinaryStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});
