interface RecprodProps {
  imageSrc: string;
  name: string;
  price: string | number;
  size: string;
}

const Recprod: React.FC<RecprodProps> = ({ imageSrc, name, price, size }) => {
  return (
    <div className="bg-white border border-gray-300 p-4 rounded-lg shadow-md">
      <img src={imageSrc} alt={name} className="w-full h-40 object-cover rounded-lg mb-2" />
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-gray-600">Size: {size}</p>
      <p className="text-green-600 font-semibold">{price} ฿</p>
    </div>
  );
};

export default Recprod;
