'use client';

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from 'react';
import ProductCardd from '../components/ProductCardd';
import Link from 'next/link';

interface Product {
    id: number;
    pictures: string[];
    name: string;
    price: string | number;
    size: string;
}

export default function ShopallPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/ProductGet');
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <Navbar />
            <div className='min-h-screen'>
                <div className="w-full h-[40px] flex justify-between items-center px-5 border-black border-[1px]">
                    <button className="text-black">FILTER</button>
                    <button className="text-black">SORT</button>
                </div>
                <div className="flex flex-wrap">
                    {products.map((product) => (
                        <Link key={product.id} href={`/buy?id=${product.id}`}>
                        <ProductCardd
                            imageSrc={product.pictures[0] || '/default.jpg'} 
                            name={product.name}
                            price={typeof product.price === 'number' ? product.price.toString() : product.price} 
                            size={product.size || 'N/A'} 
                        />
                        </Link>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}
