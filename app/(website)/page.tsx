"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "./components/ProductCard";
import AnotherProductCard from "./components/AnotherProductCard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SlidingTextBanner from "./components/SlidingTextBanner";
import Link from "next/link";
import Image from "next/image";

interface Product {
  // กำหนดประเภทของผลิตภัณฑ์
  id: number;
  pictures: string[];
  name: string;
  price: string | number; // ยอมรับเป็น string หรือ number
  size: string;
}

const anotherProducts = [
  {
    imageSrc: "/image4.png",
    title: "NO DRUNK AND DRIVE",
    date: "21 November 2024",
    info: "READ MORE",
  },
  // ข้อมูลอื่น ๆ ตามที่คุณต้องการ
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/ProductGet"); // เส้นทางสำหรับ API ของคุณ
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <div className="min-h-screen">
        <SlidingTextBanner
          texts={[
            "Welcome to Our Store!",
            "Discover the Latest Trends!",
            "Shop Now and Save Big!",
            "Exclusive Deals Available!",
          ]}
          speed={20} // ความเร็วของข้อความ (15 วินาที/รอบ)
          textColor="white"
        />
        <Navbar />
        <div className="flex">
          <Image
            src="/Rectangle 268.png"
            alt="Banner"
            width={500}
            height={300}
            className="w-full h-full"
          />
          <Image
            src="/man.png"
            alt="Man Image"
            width={500}
            height={300}
            className="w-full h-full"
          />
        </div>

        <div className="bg-white w-full h-[100px] flex items-center pl-[20px]">
          <h1 className="text-black text-[20px] font-bold">
            OUR RECOMMEND PRODUCT
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {products.map((product) => (
            <Link key={product.id} href={`/buy?id=${product.id}`}>
              <ProductCard
                imageSrc={product.pictures[0] || "/default.jpg"}
                name={product.name}
                price={
                  typeof product.price === "number"
                    ? product.price.toString()
                    : product.price
                }
                size={product.size || "N/A"}
              />
            </Link>
          ))}
        </div>
        <div className="bg-white w-full h-[100px] flex justify-start items-center pl-[20px] py-6">
          <a href="/shopall">
            <h1 className="text-black text-[20px] font-bold border-b border-black">
              SHOP ALL
            </h1>
          </a>
        </div>
        <div className="flex">
          {anotherProducts.map((product, index) => (
            <AnotherProductCard
              key={index}
              imageSrc={product.imageSrc}
              title={product.title}
              date={product.date}
              info={product.info}
            />
          ))}
        </div>
        <Image
          src="/img5.png"
          alt=""
          width={500}
          height={300}
          className="w-full h-[523px]"
        />
        <Image
          src="/Rectangle 271.png"
          width={500}
          height={300}
          alt=""
          className="w-full"
        />
        <Footer />
        <Image
          src="/Rectangle 276.png"
          width={500}
          height={300}
          alt=""
          className="w-full"
        />
      </div>
    </>
  );
}
