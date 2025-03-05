import { useRouter } from "next/navigation";

interface RecprodProps {
  id: string;
  imageSrc: string;
  name: string;
  price: string | number;
  size: string;
}

const Recprod: React.FC<RecprodProps> = ({ id, imageSrc, name, price, size }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/buy?id=${id}`); // ✅ เปลี่ยนหน้าไปที่ `/buy?id=[id]`
  };

  return (
    <div
      className="bg-white border border-gray-300 p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
      onClick={handleClick} // ✅ เพิ่ม event คลิก
    >
      <img src={imageSrc} alt={name} className="w-full h-40 object-cover rounded-lg mb-2" />
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-gray-600">Size: {size}</p>
      <p className="text-green-600 font-semibold">{price} ฿</p>
    </div>
  );
};

export default Recprod;
