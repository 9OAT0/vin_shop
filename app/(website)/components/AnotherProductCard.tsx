import React from 'react';
import Image from "next/image";

interface AnotherProductProps {
  imageSrc: string;
  title: string;
  date: string;
  info: string;
}

const AnotherProductCard: React.FC<AnotherProductProps> = ({
  imageSrc,
  title,
  date,
  info
}) => {
  return (
    <div className="flex flex-col max-w-[632px] w-full mx-auto">
      {/* Image */}
      <Image
        src={imageSrc}
        width={632}
        height={400}
        alt={title}
        className="w-full h-auto object-cover rounded-t-md"
      />

      {/* Info Box */}
      <div className="bg-white flex flex-col justify-between px-5 py-4 border border-black rounded-b-md">
        <h1 className="text-black text-xl font-bold">{title}</h1>
        <h2 className="text-black text-lg font-semibold">{date}</h2>
        <p className="text-black text-base">{info}</p>
      </div>
    </div>
  );
};

export default AnotherProductCard;
