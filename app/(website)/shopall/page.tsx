'use client'; // เพื่อให้ใช้ useEffect ได้

import { useEffect, useState } from 'react';
import ProductCardd from '../components/ProductCardd';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

interface Product { // กำหนดประเภทของผลิตภัณฑ์
  id: number; 
  pictures: string[];
  name: string;
  price: string | number; // ยอมรับเป็น string หรือ number
  size: string;
}

export default function ShopallPage() {
  const [products, setProducts] = useState<Product[]>([]); // State สำหรับเก็บข้อมูลผลิตภัณฑ์
  const [loading, setLoading] = useState(true); // State สำหรับสถานะการโหลด

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/ProductGet'); // URL ของ API
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Network response was not ok: ${errorText}`);
        }
        const data = await response.json();
        setProducts(data); // เก็บข้อมูลใน state
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false); // เปลี่ยนสถานะการโหลดเป็น false
      }
    };

    fetchProducts(); // เรียกฟังก์ชันดึงข้อมูล
  }, []); // Dependencies เป็น array ว่างเพื่อทำงานเฉพาะเมื่อ Component ถูก mount

  if (loading) {
    return <div>Loading...</div>; // แสดงข้อความ Loading ขณะรอข้อมูล
  }

  return (
    <>
      <Navbar />
      <div className='min-h-screen'>
        <div className="w-full h-[40px] bg-white flex justify-between items-center px-5 border-black border-[1px]">
          <a href=""><div className="text-black"><h1>FILTER</h1></div></a>
          <a href=""><div className="text-black"><h1>SORT</h1></div></a>
        </div>
        <div className="flex flex-wrap">
          {products.map((product) => (
            <ProductCardd
              key={product.id} // ใช้ id ของผลิตภัณฑ์แทน index
              imageSrc={product.pictures[0] || '/default.jpg'} // ใช้รูปภาพแรกจาก array หรือ default
              name={product.name}
              price={typeof product.price === 'number' ? product.price.toString() : product.price} // แปลงเป็น string ถ้าจำเป็น
              size={product.size || 'N/A'}
            />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}