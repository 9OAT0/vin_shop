import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    try {
        const { orderId, status, trackingId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        console.log("Updating order:", orderId, { status, trackingId });

        // ✅ Replace this with actual database update logic
        return NextResponse.json({ message: "Order updated successfully" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
