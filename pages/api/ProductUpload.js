import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './CouldinaryConfig'; 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const { name } = req.body;
    const timestamp = Date.now();
    return {
      folder: 'products',
      allowedFormats: ['jpg', 'png', 'jpeg'],
      public_id: `${name}_${timestamp}` // ตั้งชื่อให้ไม่ซ้ำกัน
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ขนาดสูงสุด 5MB
});

export const config = {
  api: {
    bodyParser: false,
  },
};

// API Handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    upload.array('pictures', 5)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'Error uploading file: ' + err.message });
      }

      const { name, price, size, description } = req.body;

      if (!name || !price || !size || !description || !req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'All fields are required, including at least one file.' });
      }

      const pictures = req.files.map(file => file.path);

      try {
        const product = await prisma.products.create({
          data: {
            name,
            pictures,
            price: parseFloat(price),
            size,
            description,
          },
        });

        res.status(201).json(product);
      } catch (error) {
        console.error('Error saving product:', error.message);
        res.status(500).json({ error: 'Error saving product', details: error.message });
      }
    });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}