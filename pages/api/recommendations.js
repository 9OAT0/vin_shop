import { PrismaClient } from "@prisma/client";

const globalForPrisma = global; // 👈 reuse Prisma Client ใน dev
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default async function handler(req, res) {
  if (req.method === "GET") {
    res.setHeader("Access-Control-Allow-Origin", "*"); // 👈 CORS allow all
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    try {
      console.log("📢 Fetching recommended products...");

      const allProducts = await prisma.products.findMany();
      const total = allProducts?.length || 0;

      console.log(`✅ Total Products Found: ${total}`);

      if (total === 0) {
        return res.status(404).json({ error: "❌ No products found." });
      }

      const count = total <= 4 ? total : 4;
      const recommendedProducts = allProducts
        .sort(() => 0.5 - Math.random()) // 👈 Shuffle
        .slice(0, count);

      console.log("✅ Recommended Products:", recommendedProducts);
      return res.status(200).json(recommendedProducts);
    } catch (error) {
      console.error("❌ Error fetching recommendations:", error.message);
      return res.status(500).json({
        error: "❌ Internal Server Error",
        details: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `❌ Method ${req.method} Not Allowed` });
  }
}