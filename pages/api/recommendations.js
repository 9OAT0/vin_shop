import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      console.log("📢 Fetching recommended products...");

      const allProducts = await prisma.products.findMany();
      console.log("✅ Total Products Found:", allProducts.length);

      if (allProducts.length === 0) {
        return res.status(404).json({ error: "❌ No products found." });
      }

      const count = allProducts.length <= 4 ? allProducts.length : 4;
      const recommendedProducts = allProducts.sort(() => 0.5 - Math.random()).slice(0, count);

      console.log("✅ Recommended Products:", recommendedProducts);
      res.status(200).json(recommendedProducts);
    } catch (error) {
      console.error("❌ Error fetching recommendations:", error.message);
      res.status(500).json({ error: "❌ Internal Server Error", details: error.message });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: "❌ Method Not Allowed" });
  }
}
