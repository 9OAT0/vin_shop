import React from "react";
import Image from "next/image";

interface RecprodProps {
  id: string;
  imageSrc: string;
  name: string;
  price: string;
  size: string;
}

const Recprod: React.FC<RecprodProps> = ({ imageSrc, name, price, size }) => {
  return (
    <div className="border p-4 shadow-lg rounded-md">
      <Image src={imageSrc} alt={name} width={300} height={200}  className="w-full h-40 object-cover rounded-md" />
      <h2 className="text-lg font-bold mt-2">{name}</h2>
      <p className="text-gray-500">Size: {size}</p>
      <p className="text-red-500 font-bold">฿{price}</p>
    </div>
  );
};

export default Recprod;
