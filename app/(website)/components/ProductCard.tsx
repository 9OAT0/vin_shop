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
      <img src={imageSrc} alt={name} className='w-[474px] cursor-pointer'/>
      <div className="bg-white w-[474px] h-[122px] flex flex-col justify-between py-6 pl-[20px] border-black border-[1px]">
        <h1 className="text-black">{name}</h1>
        <h1 className="text-black">
          {price} / {size}
        </h1>
      </div>
    </div>
  );
};

export default ProductCard;
