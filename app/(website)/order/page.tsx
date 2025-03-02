'use client'

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from 'next/router';

// ✅ กำหนด Type สำหรับข้อมูล Order
interface Product {
    id: string;
    name: string;
    price: number;
    picture?: string;
}

interface Order {
    id: string;
    username: string;
    date: string;
    status: string;
    products: Product[];
}

export default function OrderPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // ✅ ดึง userId และ token จาก localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUserId = localStorage.getItem("userId");
            const storedToken = localStorage.getItem("token");

            console.log("🔍 UserID from localStorage:", storedUserId);
            console.log("🔍 Token from localStorage:", storedToken);

            if (storedUserId && storedToken) {
                setUserId(storedUserId);
                setToken(storedToken);
            } else {
                console.warn("⚠️ No UserID or Token found in localStorage.");
                setError("User not authenticated. Please log in.");
                setLoading(false);
            }
        }
    }, []);

    // ✅ ตรวจสอบว่า Token และ userId มีค่าก่อนเรียก API
    useEffect(() => {
        if (!userId || !token) {
            console.warn("⚠️ User not authenticated. Token or UserID is missing.", userId, token);
            return;
        }

        const fetchOrders = async () => {
            try {
                console.log("🚀 Fetching orders for userId:", userId);
                console.log("🛠️ Sending Token in Header:", token);
                const response = await axios.get(`/api/getOrders?userId=${userId}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("✅ Orders from API:", response.data);
                setOrders(response.data);
            } catch (err) {
                console.error("❌ Error fetching orders:", err);
                setError("Error fetching orders. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [userId, token]);

    return (
        <div className="min-h-screen bg-white text-black px-6 py-12">
            <div className="flex flex-col items-center gap-8">
                <h1 className="text-3xl font-bold">YOUR ORDER</h1>

                {loading && <h1 className="text-gray-500">Loading orders...</h1>}
                {error && <h1 className="text-red-500">{error}</h1>}

                {!loading && orders.length > 0 ? (
                    <div className="w-full max-w-4xl bg-gray-100 p-6 rounded-lg shadow-md">
                        {orders.map((order: Order) => (
                            <div key={order.id} className="flex flex-col gap-6">
                                <div className="flex justify-between border-b pb-4">
                                    <div className="text-lg font-semibold" >สินค้า : <Link href={`/buy/?id=${order.product.id}`} className="text-blue-600 hover:underline ml-2">
                                        {order.product.name}
                                    </Link></div>
                                    <div className={`font-semibold flex gap-7 ${order.status === "จัดส่งสำเร็จ" ? "text-green-600" : "text-orange-600"}`}>
                                        <h1 className="text-black text-left">{order.trackingId}</h1>
                                        {order.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    !loading && <h1 className="text-gray-500">No orders found.</h1>
                )}

                <Link href="/shopall">
                    <h1 className="mt-6 text-lg font-semibold text-blue-600 hover:underline">
                        Continue Shopping...
                    </h1>
                </Link>
            </div>
        </div>
    );
}
