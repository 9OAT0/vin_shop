import React from 'react';

interface RecprodProps {
  imageSrc: string;
  name: string;
  price: string | number; // รองรับทั้ง string และ number
  size: string;
}

// เปลี่ยนชื่อคอมโพเนนต์เป็น Recprod
const Recprod: React.FC<RecprodProps> = ({ imageSrc, name, price, size }) => {
  return (
    <div className="border shadow rounded-md p-4 m-2 w-1/4">
      <img src={imageSrc} alt={name} className="w-full h-auto rounded-md mb-2" />
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-md text-gray-700">Price: {price} ฿</p>
      <p className="text-sm text-gray-500">Size: {size}</p>
    </div>
  );
};

export default Recprod;