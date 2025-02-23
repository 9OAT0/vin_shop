'use client';

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Product {
    id: string;
    cartId: string;
    productId: string;
    firstPicture: string; // สามารถเพิ่มฟิลด์อื่นๆ ตามที่คุณต้องการ
}

interface CartDetails {
    id: string;
    userId: string;
    products: Product[];
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);

    useEffect(() => {
        // ดึง User ID และ Token จาก localStorage
        const storedUserId = localStorage.getItem("userId");
        const storedAuthToken = localStorage.getItem("token");

        console.log('UserID:', storedUserId);
        console.log('AuthToken:', storedAuthToken);

        setUserId(storedUserId);
        setAuthToken(storedAuthToken);

        const fetchCartItems = async () => {
            setLoading(true);
            try {
                if (storedUserId && storedAuthToken) {
                    const response = await fetch(`/api/getCartDetails?userId=${storedUserId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${storedAuthToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data: CartDetails = await response.json();
                        // ตรวจสอบให้แน่ใจว่า products เป็น array ก่อนตั้งค่า
                        if (Array.isArray(data.products)) {
                            setCartItems(data.products);
                        } else {
                            setCartItems([]);
                            setErrorMessage('ได้รับข้อมูลที่ไม่ถูกต้องจากเซิร์ฟเวอร์');
                        }
                    } else if (response.status === 403) {
                        setErrorMessage('ไม่สามารถดึงข้อมูลสินค้าจากตะกร้าได้: Forbidden');
                    } else {
                        setErrorMessage('ไม่สามารถดึงข้อมูลสินค้าจากตะกร้าได้: ' + response.statusText);
                    }
                } else {
                    setErrorMessage('โปรดเข้าสู่ระบบเพื่อดูตะกร้าสินค้า');
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    setErrorMessage('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าจากตะกร้า: ' + error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
    }, []);

    return (
        <>
            <div className="min-h-screen bg-white text-black">
                <div className="flex flex-col gap-4">
                    <Navbar />
                    <div className="flex flex-col gap-5">
                        <div className="pl-5">
                            <h1 className="font-semibold text-xl">YOUR CART</h1>
                        </div>

                        {loading ? (
                            <div className="pl-5"><h2 className="text-[14px]">กำลังโหลด...</h2></div>
                        ) : errorMessage ? (
                            <div className="pl-5">
                            <h2 className="text-red-600">{errorMessage}</h2></div>
                        ) : cartItems.length === 0 ? (
                            <div className="pl-5"><h2 className="text-[14px]">ตะกร้าของคุณว่างเปล่า...</h2></div>
                        ) : (
                            cartItems.map(item => (
                                <div key={item.id} className="pl-5 border-b py-2">
                                    <img src={item.firstPicture} alt={item.productId} className="w-20 h-20" />
                                    <span>{item.productId}</span>
                                </div>
                            ))
                        )}
                        <div className="pl-5">
                            <a href="/" className="border-black border-b">กลับไปช็อปปิ้ง →</a>
                        </div>
                    </div>
                    <img src="/Rectangle 271.png" alt="Banner" className="w-full h-12" />
                </div>
                <Footer />
            </div>
        </>
    );
}