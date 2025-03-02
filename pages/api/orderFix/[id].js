import { PrismaClient, OrderStatus } from "@prisma/client";
import { authenticateToken } from "../auth"; 

const prisma = new PrismaClient();
const allowedStatuses = Object.values(OrderStatus); // Ensures only Prisma-defined values

export default async function handler(req, res) {
  try {
    console.log("📌 API Call Received:", req.method, req.query.id);
    
    await authenticateToken(req, res, async () => {
      const { method } = req;
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "❌ Order ID is required." });
      }

      if (method === "PUT") {
        const { status, trackingId } = req.body;

        console.log("📝 Updating Order:", id, { status, trackingId });

        // ✅ Convert status to Prisma's Enum
        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({
            error: `❌ Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
          });
        }

        try {
          const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
              status: status, // ✅ Use Prisma Enum for OrderStatus
              trackingId: trackingId || null,
            },
          });

          console.log("✅ Order Updated:", updatedOrder);
          return res.status(200).json(updatedOrder);
        } catch (error) {
          console.error("❌ Database Error:", error.message);
          return res.status(500).json({ error: "Database update failed.", details: error.message });
        }
      } else {
        res.setHeader("Allow", ["PUT"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
      }
    });
  } catch (error) {
    console.error("❌ API Unexpected Error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
