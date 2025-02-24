'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // เปลี่ยนไปใช้ useRouter จาก next/navigation
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

interface CartItem {
    id: string; 
    productName: string; 
    firstPicture: string; 
    productId: string
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter(); // ใช้ useRouter จาก next/navigation

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId'); // ดึง User ID จาก Local Storage
        if (storedUserId) {
            setUserId(storedUserId); 
        } else {
            console.error('ไม่พบ User ID ใน localStorage');
        }
    }, []);

    useEffect(() => {
        const fetchCartItems = async () => {
            if (userId) { 
                try {
                    const response = await fetch(`/api/getCartDetails?userId=${userId}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.products && Array.isArray(data.products)) {
                            setCartItems(data.products);
                        } else {
                            console.error('ข้อมูลที่ได้รับไม่ใช่ Array หรือไม่พบฟิลด์ products:', data);
                        }
                    } else {
                        console.error('ไม่สามารถดึงข้อมูลสินค้าจากตะกร้าได้:', response.statusText);
                    }
                } catch (error) {
                    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าจากตะกร้า:', error);
                }
            }
        };

        fetchCartItems();
    }, [userId]);

    const handleDelete = (id: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
        console.log(`Product with ID: ${id} has been removed from the cart`);
    };

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
                                <div key={item.id} className="px-5 flex items-center justify-between">
                                    <Link className="flex items-center cursor-pointer" href={`/buy?id=${item.id}`}>
                                        <img src={item.firstPicture} alt={item.productName} className="w-16 h-16 object-cover mr-4" />
                                        <div>{item.productName}</div>
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(item.id)} 
                                        className="bg-red-500 text-white px-4 py-2 rounded transition hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
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