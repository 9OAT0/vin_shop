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

function BuyPage() {
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

    try {
      const response = await fetch("/api/addtocart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ send cookies
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      if (response.status !== 201) {
        const errorData = await response.text();
        console.error("Error data from API:", errorData);
        alert("Product may already be in cart or authentication failed.");
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/2 p-5">
          <Image
            src={product.pictures?.[0] || "/default.jpg"}
            alt={product.name || "Product image"}
            width={500}
            height={500}
            className="w-full h-auto object-cover rounded-lg mb-4"
          />
          <div className="flex flex-wrap">
            {product.pictures?.slice(1).map((picture, index) => (
              <Image
                key={index}
                src={picture}
                alt={`${product.name || "Product"} Thumbnail ${index + 1}`}
                width={100}
                height={100}
                className="w-1/3 h-32 object-cover m-1 rounded-lg"
              />
            ))}
          </div>
        </div>

        <div className="lg:w-1/2 p-5 flex flex-col sticky top-10 z-10 bg-white">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="border border-gray-300 p-4 mt-4">
            <p className="text-lg">Size: {product.size || "N/A"}</p>
            <p className="text-lg">
              Price:{" "}
              {typeof product.price === "number"
                ? product.price.toString()
                : product.price}{" "}
              ฿
            </p>
            <p className="mt-2">Fabric: Cotton 100%</p>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-black text-white py-2 px-4 mt-5 rounded transition duration-300 ease-in-out hover:bg-gray-800"
            disabled={isAddingToCart}
          >
            {isAddingToCart ? "Adding..." : "ADD TO CART"}
          </button>
        </div>
      </div>

      <div className="w-full h-10 border border-black flex justify-center items-center mt-4">
        <p>YOU MAY ALSO ENJOY</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RecommendedProducts />
      </div>
      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BuyPage />
    </Suspense>
  );
}
