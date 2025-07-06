import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from './CouldinaryConfig';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const { name } = req.body || { name: 'unknown' };
    const timestamp = Date.now();
    return {
      folder: 'products',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      public_id: `${name}_${timestamp}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
    externalResolver: true,
  },
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  const token = req.cookies?.token;
  let userPayload = null;

  if (token) {
    try {
      userPayload = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      console.error('❌ Invalid token:', err.message);
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
  }

  if (req.method === 'GET') {
    try {
      const products = await prisma.products.findMany();
      console.log(`✅ Fetched ${products.length} products`);
      return res.status(200).json(products);
    } catch (error) {
      console.error('❌ Error fetching products:', error.message);
      return res.status(500).json({ error: 'Error fetching products', details: error.message });
    }
  }

  if (!userPayload || userPayload.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Only ADMIN can modify products.' });
  }

  if (req.method === 'POST') {
    upload.array('pictures', 5)(req, res, async (err) => {
      if (err) {
        console.error('❌ Upload error:', err.message);
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
        console.log(`✅ Product created: ${product.id}`);
        return res.status(201).json(product);
      } catch (error) {
        console.error('❌ Error saving product:', error.message);
        return res.status(500).json({ error: 'Error saving product', details: error.message });
      }
    });
    return; // Important: prevent running further
  }

  if (req.method === 'PUT') {
    upload.array('pictures', 5)(req, res, async (err) => {
      if (err) {
        console.error('❌ Upload error:', err.message);
        return res.status(400).json({ error: 'Error uploading file: ' + err.message });
      }

      const { productId, name, price, size, description } = req.body;
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required for update.' });
      }

      try {
        const existingProduct = await prisma.products.findUnique({ where: { id: productId } });
        if (!existingProduct) {
          return res.status(404).json({ error: 'Product not found.' });
        }

        let pictures = existingProduct.pictures;
        if (req.files && req.files.length > 0) {
          pictures = req.files.map(file => file.path);
        }

        const updatedProduct = await prisma.products.update({
          where: { id: productId },
          data: {
            name: name || existingProduct.name,
            price: price ? parseFloat(price) : existingProduct.price,
            size: size || existingProduct.size,
            description: description || existingProduct.description,
            pictures,
          },
        });
        console.log(`✅ Product updated: ${updatedProduct.id}`);
        return res.status(200).json(updatedProduct);
      } catch (error) {
        console.error('❌ Error updating product:', error.message);
        return res.status(500).json({ error: 'Error updating product', details: error.message });
      }
    });
    return; // Important
  }

  if (req.method === 'DELETE') {
    let productId = req.query.productId;

    // Fallback: parse JSON body if productId not in query
    if (!productId && req.headers['content-type']?.includes('application/json')) {
      try {
        const buffers = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const body = JSON.parse(Buffer.concat(buffers).toString());
        productId = body.productId;
      } catch {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required for deletion.' });
    }

    try {
      const existingProduct = await prisma.products.findUnique({ where: { id: productId } });
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      await prisma.products.delete({ where: { id: productId } });
      console.log(`✅ Product deleted: ${productId}`);
      return res.status(200).json({ message: 'Product deleted successfully.' });
    } catch (error) {
      console.error('❌ Error deleting product:', error.message);
      return res.status(500).json({ error: 'Error deleting product', details: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}