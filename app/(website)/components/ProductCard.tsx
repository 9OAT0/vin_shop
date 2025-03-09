// components/ProductCard.tsx
import React from 'react';
import Image from "next/image";

interface ProductProps {
  imageSrc: string;
  name: string;
  price: string;
  size: string;
}

const ProductCard: React.FC<ProductProps> = ({ imageSrc, name, price, size }) => {
  return (
    <div>
      
        <div className="border shadow rounded-md p-4 m-2 hover:border-white hover:border-2">
          <Image src={imageSrc} width={300} height={200} alt={name} className="w-[250px] h-[250px] rounded-md mb-2" />
          <h2 className="text-lg font-bold">{name}</h2>
          <p className="text-md text-white">Price: {price} ฿</p>
          <p className="text-sm text-white">Size: {size}</p>
        </div>
      
      
    </div>
  );
};

export default ProductCard;
