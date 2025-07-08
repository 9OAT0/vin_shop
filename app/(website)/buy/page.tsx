"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import RecommendedProducts from "../components/RecommendProduct";
import Image from "next/image";

interface Product {
  id: number;
  pictures: string[];
  name: string;
  price: string | number;
  size: string;
}

function BuyProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams?.get("id") ?? "";

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Network response was not ok: ${errorText}`);
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching product:", error);
          setError(error.message);
        } else {
          console.error("Unexpected error:", error);
          setError("Failed to load product due to an unexpected error");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;
    setIsAddingToCart(true);

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId) {
      alert("Please log in to add products to your cart.");
      setIsAddingToCart(false);
      return;
    }

    try {
      const response = await fetch("/api/addtocart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          userId,
          productId: product.id,
        }),
      });

      if (response.status !== 201) {
        const errorData = await response.text();
        console.error("Error data from API:", errorData);
        alert("Product already in cart");
      } else {
        const result = await response.json();
        console.log("Product added to cart:", result);
        alert("Product added to cart successfully!");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error adding product to cart:", error.message);
        setError(error.message);
      } else {
        console.error("Unexpected error:", error);
        setError("Failed to add product to cart due to an unexpected error");
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!product) return <div className="text-center py-10">Product not found.</div>;

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      {/* Product Detail */}
      <div className="flex flex-col lg:flex-row gap-8 p-5">
        {/* Images */}
        <div className="lg:w-1/2 flex flex-col">
          <Image
            src={product.pictures?.[0] || "/default.jpg"}
            alt={product.name}
            width={500}
            height={500}
            className="w-full h-auto object-cover rounded-lg mb-4"
          />
          <div className="grid grid-cols-3 gap-2">
            {product.pictures?.slice(1).map((picture, index) => (
              <Image
                key={index}
                src={picture}
                alt={`${product.name} Thumbnail`}
                width={150}
                height={150}
                className="w-full h-32 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="lg:w-1/2 flex flex-col sticky top-10 bg-white p-5 rounded shadow">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="border border-gray-300 p-4 mt-4 rounded">
            <p className="text-lg">Size: {product.size || "N/A"}</p>
            <p className="text-lg">
              Price: {typeof product.price === "number" ? product.price.toFixed(2) : product.price} ฿
            </p>
            <p className="mt-2 text-gray-600">Fabric: Cotton 100%</p>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-black text-white py-3 px-6 mt-5 rounded hover:bg-gray-800 disabled:opacity-50"
            disabled={isAddingToCart}
          >
            {isAddingToCart ? "Adding..." : "ADD TO CART"}
          </button>
        </div>
      </div>

      {/* Recommendations */}
      <div className="text-center my-8">
        <h2 className="text-xl font-semibold mb-4 border border-black p-2">YOU MAY ALSO ENJOY</h2>
        <RecommendedProducts />
      </div>

      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <BuyProductPage />
    </Suspense>
  );
}