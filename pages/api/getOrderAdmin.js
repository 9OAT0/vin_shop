import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "./auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  await authenticateToken(req, res, async () => {
    if (req.method === "GET") {
      try {
        console.log("📌 Fetching orders from database...");
        
        const orders = await prisma.order.findMany();

        if (!orders || orders.length === 0) {
          console.warn("⚠️ No orders found.");
          return res.status(404).json({ error: "No orders found" });
        }

        console.log("✅ Orders Retrieved:", orders);
        res.status(200).json(orders);
      } catch (error) {
        console.error("❌ Error fetching orders:", error.message);
        res.status(500).json({ error: "Server Error", details: error.message });
      }
    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }
  });
}
