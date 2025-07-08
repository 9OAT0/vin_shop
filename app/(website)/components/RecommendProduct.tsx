"use client";

import Recprod from "./Recprod";
import Link from "next/link";
import { useEffect, useState } from "react";

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
        const response = await fetch("/api/recommendations");
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, []);

  if (loading) return <p className="text-center">Loading recommendations...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/buy?id=${product.id}`}
          className="h-full border border-black hover:border-black hover:border-2"
        >
          <Recprod
            id={product.id}
            imageSrc={product.pictures?.[0] || "/default.jpg"}
            name={product.name}
            price={typeof product.price === "number" ? product.price.toString() : product.price}
            size={product.size || "N/A"}
          />
        </Link>
      ))}
    </div>
  );
}