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
  id: number;
  pictures: string[];
  name: string;
  price: string | number;
  size?: string;
}

const anotherProducts = [
  {
    imageSrc: "/image4.png",
    title: "NO DRUNK AND DRIVE",
    date: "21 November 2024",
    info: "READ MORE",
  },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/Product");
        if (!response.ok) {
          throw new Error(`Network error: ${response.status}`);
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-lg">Loading products...</div>;
  }

  return (
    <>
      <div className="min-h-screen">
        {/* Sliding Banner */}
        <SlidingTextBanner
          texts={[
            "Welcome to Our Store!",
            "Discover the Latest Trends!",
            "Shop Now and Save Big!",
            "Exclusive Deals Available!",
          ]}
          speed={20}
          textColor="white"
        />

        {/* Navbar */}
        <Navbar />

        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row">
          <Image
            src="/Rectangle 268.png"
            alt="Promotional Banner"
            width={1920}
            height={600}
            className="w-full object-cover"
            priority
          />
          <Image
            src="/man.png"
            alt="Fashion Model"
            width={1920}
            height={600}
            className="w-full object-cover"
            priority
          />
        </div>

        {/* Recommended Products */}
        <div className="bg-white w-full h-[100px] flex items-center pl-5">
          <h1 className="text-black text-xl font-bold">
            OUR RECOMMENDED PRODUCTS
          </h1>
        </div>

        <div className="flex flex-wrap gap-4 p-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/buy?id=${product.id}`}
              className="w-full sm:w-1/2 lg:w-1/3"
            >
              <ProductCard
                imageSrc={product.pictures?.[0] || "/default.jpg"}
                name={product.name}
                price={
                  typeof product.price === "number"
                    ? product.price.toFixed(2)
                    : product.price
                }
                size={product.size || "N/A"}
              />
            </Link>
          ))}
        </div>

        {/* Shop All Link */}
        <div className="bg-white w-full h-[100px] flex justify-start items-center pl-5 py-6">
          <Link
            href="/shopall"
            className="text-black text-lg font-bold border-b border-black"
          >
            SHOP ALL
          </Link>
        </div>

        {/* Another Products Section */}
        <div className="flex flex-col sm:flex-row gap-4 p-4">
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

        {/* Full-width Images */}
        <Image
          src="/img5.png"
          alt="Campaign Banner"
          width={1920}
          height={523}
          className="w-full object-cover"
          priority
        />
        <Image
          src="/Rectangle 271.png"
          width={1920}
          height={600}
          alt="Additional Banner"
          className="w-full object-cover"
        />

        <Footer />

        <Image
          src="/Rectangle 276.png"
          width={1920}
          height={600}
          alt="Closing Banner"
          className="w-full object-cover"
        />
      </div>
    </>
  );
}
