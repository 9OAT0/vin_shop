<<<<<<< Updated upstream
import { useRouter } from "next/navigation";

interface RecprodProps {
  id: string;
  imageSrc: string;
=======
"use client";

import { useEffect, useState } from "react";
import Recprod from "./Recprod";

interface Product {
  id: string;
>>>>>>> Stashed changes
  name: string;
  price: number | string;
  size: string;
  pictures: string[];
}

<<<<<<< Updated upstream
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
=======
export default function RecommendedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      setLoading(true);
      try {
        console.log("📢 Fetching recommendations from /api/recommendations...."); // ✅ Debug

        const response = await fetch("/api/recommendations");
        if (!response.ok) throw new Error(`❌ Failed to fetch: ${response.statusText}`);

        const data: Product[] = await response.json();
        console.log("✅ Data received:", data); // ✅ Debug

        if (data.length === 0) {
          setError("❌ No recommended products available.");
        } else {
          setProducts(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, []);

  if (loading) return <p>Loading recommendations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <Recprod
          key={product.id}
          imageSrc={product.pictures?.[0] || "/default.jpg"}
          name={product.name}
          price={typeof product.price === "number" ? product.price.toString() : product.price}
          size={product.size || "N/A"}
        />
      ))}
>>>>>>> Stashed changes
    </div>
  );
}
