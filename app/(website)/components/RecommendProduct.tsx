"use client";

import { useEffect, useState } from "react";
import Recprod from "./Recprod";

interface Product {
  id: string;
  name: string;
  price: number | string;
  size: string;
  pictures: string[];
}

export default function RecommendedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      setLoading(true);
      try {
        console.log("📢 Fetching recommendations from /api/recommended...");

        const response = await fetch("/api/recommendations");
        if (!response.ok) throw new Error(`❌ Failed to fetch: ${response.statusText}`);

        const data: Product[] = await response.json();
        console.log("✅ Data received:", data);

        if (data.length === 0) {
          setError("❌ No recommended products available.");
        } else {
          setProducts(data);
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-[200%]">
      {products.map((product) => (
        <Recprod
        key={product.id}
        id={product.id} // ✅ Now `id` is valid!
        imageSrc={product.pictures?.[0] || "/default.jpg"}
        name={product.name}
        price={typeof product.price === "number" ? product.price.toString() : product.price}
        size={product.size || "N/A"}
      />      
      ))}
    </div>
  );
}
