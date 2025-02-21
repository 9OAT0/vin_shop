'use client';

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface CartItem {
    id: number; // หรือ string ขึ้นอยู่กับประเภทจริงของ ID
    productName: string; // ชื่อสินค้าหรือข้อมูลอื่น ๆ ที่คุณต้องการ
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [userId, setUserId] = useState<string | null>(null); // state สำหรับ userId
    const [token, setToken] = useState<string | null>(null); // state สำหรับ token

    useEffect(() => {
        // ดึงข้อมูลจาก localStorage และตั้งค่า state
        const storedUserId = localStorage.getItem('userId');
        const storedToken = localStorage.getItem('token');
        if (storedUserId) setUserId(storedUserId);
        if (storedToken) setToken(storedToken);
    }, []);

    useEffect(() => {
        const fetchCartItems = async () => {
            if (!userId || !token) return; // ไม่ทำงานถ้า userId หรือ token ไม่มี

            try {
                const response = await fetch(`/api/checkCart?userId=${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                
                if (response.ok) {
                    const data: CartItem[] = await response.json();
                    setCartItems(data);
                } else {
                    console.error('ไม่สามารถดึงข้อมูลสินค้าจากตะกร้าได้:', response.statusText);
                }
            } catch (error) {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าจากตะกร้า:', error);
            }
        };

        fetchCartItems();
    }, [userId, token]); // dependency array ที่ใช้ state ที่ต้องการ

    return (
        <>
            <div className="min-h-screen bg-white text-black">
                <div className="flex flex-col gap-4">
                    <Navbar />
                    <div className="flex flex-col gap-5">
                        <div className="pl-5">
                            <h1 className="">YOUR CART</h1>
                        </div>
                        {cartItems.length === 0 ? (
                            <div className="pl-5"><h2 className="text-[14px]">Your cart is empty...</h2></div>
                        ) : (
                            cartItems.map(item => (
                                <div key={item.id} className="pl-5">
                                    <div>{item.productName}</div>
                                </div>
                            ))
                        )}
                        <div className="pl-5">
                            <a href="/" className="border-black border-b">Continue shopping →</a>
                        </div>
                    </div>
                    <img src="/Rectangle 271.png" alt="" className="w-full h-12" />
                </div>
                <Footer />
            </div>
        </>
    );
}