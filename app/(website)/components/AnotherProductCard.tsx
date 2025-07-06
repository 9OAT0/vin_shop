// components/AnotherProductCard.tsx
import React from 'react';
import Image from "next/image";

interface AnotherProductProps {
  imageSrc: string;
  title: string;
  date: string;
  info: string;
}

const AnotherProductCard: React.FC<AnotherProductProps> = ({ imageSrc, title, date, info }) => {
  return (
    <div className="flex flex-col">
      <Image src={imageSrc} width={300} height={200} alt={title} className="w-[632px] h-[100%]" />
      <div className='bg-white w-[632px] h-[150px] flex flex-col justify-between pl-[20px] border-black border-[1px] py-5'>
        <h1 className="text-black text-xl font-bold">{title}</h1>
        <h1 className="text-black text-xl  font-bold">{date}</h1>
        <h2 className="text-black font-semibold">{info}</h2>
      </div>
      
    </div>
  );
};

export default AnotherProductCard;
