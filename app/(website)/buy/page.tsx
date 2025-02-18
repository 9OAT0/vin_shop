'use client';

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from 'react';
import Recprod from '../components/Recprod';
import { useSearchParams } from 'next/navigation';

interface Product {
    id: number;
    pictures: string[];
    name: string;
    price: string | number; 
    size: string;
}

export default function BuyPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const searchParams = useSearchParams();
    const id = searchParams?.get('id') ?? ''; // 🔥 แก้ไขตรงนี้

    useEffect(() => {
        if (!id) return; 

        const fetchProduct = async () => {
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

    const handleAddToCart = async () => {
        if (!product) {
            console.log('No product data available');
            return; // ถ้ามีผลิตภัณฑ์ให้ย้อนกลับ
        }
        
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token'); // รับ userId จาก localStorage
        
        if (!userId) {
            alert('Please log in to add products to your cart.'); // แจ้งผู้ใช้หากยังไม่ได้ล็อกอิน
            return; // ถ้าไม่มี userId ให้ยกเลิก
        }
    
        console.log('User ID:', userId); // ตรวจสอบ userId
        console.log('Product ID:', product.id); // ตรวจสอบ product ID
        console.log('Received:', { userId, product });
    
        try {
            const response = await fetch('/api/addtocart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    userId,
                    productId: product.id, // ส่ง productId
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error data from API:', errorData); // Log ข้อมูลข้อผิดพลาด
                throw new Error(errorData.error || 'Failed to add product to cart');
            }
    
            const result = await response.json();
            console.log('Product added to cart:', result);
            alert('Product added to cart successfully!');
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error adding product to cart:', error.message);
                setError(error.message);
            } else {
                console.error('Unexpected error:', error);
                setError('Failed to add product to cart due to an unexpected error');
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>; 
    }

    if (!product) {
        return <div>Product not found.</div>; 
    }

    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="flex">
                <div className="flex flex-col">
                    <img src={product.pictures?.[0] || '/default.jpg'} alt={product.name} className="max-w-[80%]"/>
                    <div className="max-w-[40%] flex">
                        {product.pictures?.map((picture, index) => (
                            <img key={index} src={picture} alt={`${product.name} Thumbnail`} />
                        ))}
                    </div>
                </div>
                <div>
                    <div className="flex flex-col gap-2 border-[1px] border-black pl-3">
                        <h1 className="text-xl font-bold pt-5">{product.name}</h1>
                        <div className="flex flex-col gap-6">
                            <p>Size: {product.size || 'N/A'}</p>
                            <p>Price: {typeof product.price === 'number' ? product.price.toString() : product.price} ฿</p>
                            <p>Details: {/* แสดงรายละเอียดเพิ่มเติมเกี่ยวกับผลิตภัณฑ์ */} </p>
                            <p>Fabric: cotton 100%</p>
                        </div>
                    </div>
                    <button onClick={handleAddToCart} className="pl-3 py-5 border-b border-black">
                        <p className="text-white font-bold bg-black max-w-[80%] h-10 flex justify-center items-center">ADD TO CART</p>
                    </button>
                </div>
            </div>
            <div className="w-full h-10 border border-black flex justify-center items-center">
                <p>YOU MAY ALSO ENJOY</p>
            </div>
            <Recprod 
                key={product.id} 
                imageSrc={product.pictures?.[0] || '/default.jpg'}
                name={product.name}
                price={typeof product.price === 'number' ? product.price.toString() : product.price}
                size={product.size || 'N/A'}
            />
            <Footer />
        </div>
    );
}
