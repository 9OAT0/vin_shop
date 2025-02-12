// components/ProductCard.tsx
import React from 'react';

interface ProductProps {
  imageSrc: string;
  name: string;
  price: string;
  size: string;
}

const ProductCard: React.FC<ProductProps> = ({ imageSrc, name, price, size }) => {
  return (
    <div>
      <a href="/buy">
        <div className="border shadow rounded-md p-4 m-2 w-1/4">
          <img src={imageSrc} alt={name} className="w-full h-auto rounded-md mb-2" />
          <h2 className="text-lg font-bold">{name}</h2>
          <p className="text-md text-gray-700">Price: {price} ฿</p>
          <p className="text-sm text-gray-500">Size: {size}</p>
        </div>
      </a>
      
    </div>
  );
};

export default ProductCard;
