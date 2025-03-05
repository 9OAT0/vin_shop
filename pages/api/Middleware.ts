// pages/api/middleware.ts
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect"; // ✅ Correct import for next-connect v0.12.2
import multer from "multer";

// ✅ Configure Multer storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Max size 5MB
});

// ✅ Multer Middleware using `next-connect`
const uploadMiddleware = nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, req, res) {
    res.status(500).json({ error: `Upload error: ${(error as Error).message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  },
}).use(upload.array("pictures", 5));

export default uploadMiddleware;
