'use client';

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface CartItem {
    id: number; // หรือ string ขึ้นอยู่กับประเภทจริงของ ID
    productName: string; // ชื่อสินค้าหรือข้อมูลอื่น ๆ ที่คุณต้องการ
    // เพิ่มฟิลด์อื่น ๆ ตามที่คุณต้องการ
}

const getUserIdFromSession = () => {
    return localStorage.getItem("userId"); // ดึง User ID จาก Local Storage
};

const getAuthToken = () => {
    return localStorage.getItem("authToken"); // ดึง Token จาก Local Storage
};

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const userId = getUserIdFromSession(); // ดึง User ID ที่แท้จริง

    useEffect(() => {
        const fetchCartItems = async () => {
            setLoading(true);
            try {
                const token = getAuthToken(); // ดึง Token
                const response = await fetch(`/api/checkCart?userId=${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // รวม Token ใน Header
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const data: CartItem[] = await response.json();
                    setCartItems(data);
                } else if (response.status === 403) {
                    setErrorMessage('ไม่สามารถดึงข้อมูลสินค้าจากตะกร้าได้: Forbidden'); // ข้อความเมื่อถูกห้าม
                } else {
                    setErrorMessage('ไม่สามารถดึงข้อมูลสินค้าจากตะกร้าได้: ' + response.statusText);
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    setErrorMessage('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าจากตะกร้า: ' + error.message);
                } else {
                    setErrorMessage('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าจากตะกร้า: ' + String(error));
                }
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchCartItems(); // เรียกฟังก์ชันดึงข้อมูลตะกร้าหากมี User ID
        } else {
            setErrorMessage('โปรดเข้าสู่ระบบเพื่อดูตะกร้าสินค้า'); // แจ้งให้ผู้ใช้เข้าสู่ระบบ
        }
    }, [userId]);

    return (
        <>
            <div className="min-h-screen bg-white text-black">
                <div className="flex flex-col gap-4">
                    <Navbar />
                    <div className="flex flex-col gap-5">
                        <div className="pl-5">
                            <h1 className="">YOUR CART</h1>
                        </div>

                        {loading ? (
                            <div className="pl-5"><h2 className="text-[14px]">กำลังโหลด...</h2></div>
                        ) : errorMessage ? (
                            <div className="pl-5"><h2 className="text-red-600">{errorMessage}</h2></div>
                        ) : cartItems.length === 0 ? (
                            <div className="pl-5"><h2 className="text-[14px]">Your cart is empty...</h2></div>
                        ) : (
                            cartItems.map(item => (
                                <div key={item.id} className="pl-5">{item.productName}</div>
                            ))
                        )}
                        <div className="pl-5">
                            <a href="/" className="border-black border-b">Continue shopping →</a>
                        </div>
                    </div>
                    <img src="/Rectangle 271.png" alt="Banner" className="w-full h-12" />
                </div>
                <Footer />
            </div>
        </>
    );
}