// pages/MainwebPage.tsx
import React from 'react';
import ProductCard from './components/ProductCard';
import AnotherProductCard from './components/AnotherProductCard';
import Navbar from "./components/Navbar"
import Footer from "./components/Footer";
import SlidingTextBanner from './components/SlidingTextBanner';

const products = [
  { imageSrc: "/image.png", name: "Shirt", price: "4,000 ฿", size: "XL" },
  { imageSrc: "/image1.png", name: "Shirt", price: "4,000 ฿", size: "XL" },
  { imageSrc: "/image2.png", name: "Shirt", price: "4,000 ฿", size: "XL" },
  { imageSrc: "/image3.png", name: "Shirt", price: "4,000 ฿", size: "XL" },
];

const anotherProducts = [
  { imageSrc: "/image4.png", title: "NO DRUNK AND DRIVE", date: "21 November 2024", info: "READ MORE" },
  { imageSrc: "/image4.png", title: "NO DRUNK AND DRIVE", date: "21 November 2024", info: "READ MORE" },
  { imageSrc: "/image4.png", title: "NO DRUNK AND DRIVE", date: "21 November 2024", info: "READ MORE" },
];

export default function Home() {
  return (
    <>
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
        <img src="/Rectangle 268.png" alt="" className="w-[926px] h-[845px]"/>
        <img src="/man.png" alt="" className="w-[970px] h-[845px]" />
      </div>
      <div className="bg-white w-full h-[100px] flex items-center pl-[20px]">
        <h1 className="text-black text-[20px] font-bold">OUR RECOMMEND PRODUCT</h1>
      </div>
      <div className="flex">
        {products.map((product, index) => (
          <ProductCard
            key={index}
            imageSrc={product.imageSrc}
            name={product.name}
            price={product.price}
            size={product.size}
          />
        ))}
      </div>
      <div className="flex">
        {products.map((product, index) => (
          <ProductCard
            key={index}
            imageSrc={product.imageSrc}
            name={product.name}
            price={product.price}
            size={product.size}
          />
        ))}
      </div>
      <div className="flex">
        {products.map((product, index) => (
          <ProductCard
            key={index}
            imageSrc={product.imageSrc}
            name={product.name}
            price={product.price}
            size={product.size}
          />
        ))}
      </div>
      <div className="bg-white w-full h-[100px] flex flex-col justify-between pl-[20px] py-6">
        <h1 className="text-black text-[20px] font-bold">SHOP ALL</h1>
        <h1 className="text-black text-[20px] font-bold">CATAGORIES</h1>
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
      <img src="/img5.png" alt="" className='w-full h-[523px]'/>
      <img src="/Rectangle 271.png" alt="" className='w-full'/>
      <Footer />
      <img src="/Rectangle 276.png" alt="" className='w-full'/>
    </>
  );
}
