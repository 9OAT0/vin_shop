import upload from '../../lib/middleware/uploadMiddleware'; // 🔥 middleware Multer ที่ทำไว้แล้ว

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  upload.array('pictures', 5)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'Upload failed', details: err.message });
    }

    const userRole = req.headers['x-user-role'];

    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Only admins can upload products.' });
    }

    if (req.method === 'POST') {
      const { name, price, size, description } = req.body;
      const pictures = req.files?.map(file => file.path) || [];

      if (!name || !price || !size || !description || pictures.length === 0) {
        return res.status(400).json({ error: 'All fields are required, including at least one file.' });
      }

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
        console.error('Error saving product:', error);
        res.status(500).json({ error: 'Error saving product', details: error.message });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}