'use client';

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from 'react';
import Recprod from '../components/Recprod';
import { useSearchParams } from 'next/navigation';
import Link from "next/link";


interface Product {
    id: number;
    pictures: string[];
    name: string;
    price: string | number;
    size: string;
    description: string;
}

export default function BuyPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]); // ✅ เก็บสินค้าที่แนะนำ
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [overlayIndex, setOverlayIndex] = useState<number | null>(null); // ✅ State สำหรับ Overlay
    const searchParams = useSearchParams();
    const id = searchParams?.get('id') ?? '';

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const response = await fetch(`/api/products/${id}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Network response was not ok: ${errorText}`);
                }
                const data = await response.json();
                setProduct(data);
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Error fetching product:', error);
                    setError(error.message);
                } else {
                    console.error('Unexpected error:', error);
                    setError('Failed to load product due to an unexpected error');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // ✅ ดึงข้อมูลสินค้าที่แนะนำจาก API
    useEffect(() => {
        const fetchRecommendedProducts = async () => {
            try {
                const response = await fetch(`/api/recommendations`);
                if (!response.ok) {
                    throw new Error('Failed to fetch recommended products');
                }
                const data = await response.json();
                setRecommendedProducts(data);
            } catch (error) {
                console.error('Error fetching recommended products:', error);
            }
        };

        fetchRecommendedProducts();
    }, []);

    // ✅ ฟังก์ชันเปิด Overlay
    const openOverlay = (index: number) => {
        setOverlayIndex(index);
    };

    // ✅ ฟังก์ชันปิด Overlay
    const closeOverlay = () => {
        setOverlayIndex(null);
    };

    // ✅ ฟังก์ชันเลื่อนรูปภาพไปทางซ้าย
    const prevImage = () => {
        if (overlayIndex !== null && product) {
            setOverlayIndex((prev) => (prev === 0 ? product.pictures.length - 1 : prev! - 1));
        }
    };

    // ✅ ฟังก์ชันเลื่อนรูปภาพไปทางขวา
    const nextImage = () => {
        if (overlayIndex !== null && product) {
            setOverlayIndex((prev) => (prev! === product.pictures.length - 1 ? 0 : prev! + 1));
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!product) {
        return <div>Product not found.</div>;
    }

    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="flex flex-col lg:flex-row">
                {/* ✅ แสดงภาพผลิตภัณฑ์ */}
                <div className="lg:w-1/2 p-5">
                    <img
                        src={product.pictures?.[0] || "/default.jpg"}
                        alt={product.name}
                        className="w-full h-auto object-cover rounded-lg mb-4 cursor-pointer"
                        onClick={() => openOverlay(0)} // ✅ เปิด Overlay เมื่อคลิก
                    />
                    <div className="flex flex-wrap">
                        {product.pictures?.slice(1).map((picture, index) => (
                            <img
                                key={index}
                                src={picture}
                                alt={`${product.name} Thumbnail`}
                                className="w-1/3 h-32 object-cover m-1 rounded-lg cursor-pointer"
                                onClick={() => openOverlay(index + 1)} // ✅ เปิด Overlay ที่ตำแหน่งของรูป
                            />
                        ))}
                    </div>
                </div>

                {/* ✅ แสดงรายละเอียดผลิตภัณฑ์ */}
                <div className="lg:w-1/2 p-5 flex flex-col sticky top-10 z-10 bg-white">
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <div className="border border-gray-300 p-4 mt-4">
                        <p className="text-lg">Size: {product.size || "N/A"}</p>
                        <p className="text-lg">Price: {product.price} ฿</p>
                        <p className="mt-2">{product.description}</p>
                    </div>
                    <button
                        className="bg-black text-white py-2 px-4 mt-5 rounded transition duration-300 ease-in-out hover:bg-gray-800"
                        disabled={isAddingToCart}
                    >
                        {isAddingToCart ? "Adding..." : "ADD TO CART"}
                    </button>
                </div>
            </div>

            <div className="w-full h-10 border border-black flex justify-center items-center mt-4">
                <p>YOU MAY ALSO ENJOY</p>
            </div>

            {/* ✅ แสดงสินค้าที่แนะนำ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                {recommendedProducts.map((recProduct) => (
                    <Link key={recProduct.id} href={`/buy/?id=${recProduct.id}`} passHref>
                        <div className="cursor-pointer">
                            <Recprod
                                imageSrc={recProduct.pictures?.[0] || "/default.jpg"}
                                name={recProduct.name}
                                price={recProduct.price}
                                size={recProduct.size || "N/A"}
                            />
                        </div>
                    </Link>
                ))}
            </div>
            <Footer />

            {/* ✅ Overlay แสดงรูปภาพขยาย */}
            {overlayIndex !== null && product && (
                <div
                    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center z-50"
                    onClick={closeOverlay} // ✅ ปิด Overlay เมื่อกดข้างนอก
                >
                    <div className="relative w-3/4 max-w-2xl">
                        <button
                            className="absolute top-2 right-2 text-white text-3xl font-bold cursor-pointer"
                            onClick={closeOverlay}
                        >
                            ✖
                        </button>
                        <button
                            className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white text-2xl font-bold cursor-pointer bg-gray-800 p-2 rounded-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                prevImage();
                            }}
                        >
                            ◀
                        </button>
                        <img
                            src={product.pictures[overlayIndex]}
                            alt="Product Zoom"
                            className="w-full max-h-[80vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()} // ✅ ป้องกันปิด Overlay เมื่อคลิกที่รูป
                        />
                        <button
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white text-2xl font-bold cursor-pointer bg-gray-800 p-2 rounded-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                nextImage();
                            }}
                        >
                            ▶
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
