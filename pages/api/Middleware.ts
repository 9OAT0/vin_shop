// pages/api/middleware.ts
import { NextResponse } from 'next/server';
import multer from 'multer';
import { NextApiRequest, NextApiResponse } from 'next';

const upload = multer({
  storage: multer.memoryStorage(), // หรือ CloudinaryStorage
  limits: { fileSize: 5 * 1024 * 1024 }, // ขนาดสูงสุด 5MB
});

// Middleware สำหรับการอัปโหลด
export function middleware(req: NextApiRequest, res: NextApiResponse) {
  return new Promise((resolve, reject) => {
    upload.array('pictures', 5)(req, res, (err) => {
      if (err) {
        return reject(err);
      } else {
        resolve(NextResponse.next());
      }
    });
  });
}