import React from "react";
import Image from "next/image";

interface ProductProps {
  imageSrc: string;
  name: string;
  price: string;
  size: string;
}

const ProductCard: React.FC<ProductProps> = ({
  imageSrc,
  name,
  price,
  size,
}) => {
  return (
    <div className="border shadow rounded-md p-4 flex flex-col h-full border-black hover:border-black hover:border-2">
      <div className="flex justify-center items-center">
        <Image
          src={imageSrc}
          width={300}
          height={300}
          alt={name}
          className="w-full h-64 object-cover rounded-md mb-2"
        />
      </div>
      <h2 className="text-lg font-bold mt-auto">{name}</h2>
      <p className="text-md text-gray-700">Price: {price} ฿</p>
      <p className="text-sm text-gray-500">Size: {size}</p>
    </div>
  );
};

export default ProductCard;