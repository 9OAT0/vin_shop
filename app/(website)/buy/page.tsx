"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
<<<<<<< Updated upstream
import { Key, useEffect, useState } from "react";
import Recprod from "../components/Recprod";
import { useSearchParams } from "next/navigation";
import RecommendedProducts from "../components/RecommendProduct";

interface Product {
  id: number;
  pictures: string[];
  name: string;
  price: string | number;
  size: string;
}

export default function BuyPage() {
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
=======
import { useEffect, useState } from 'react';
import Recprod from '../components/Recprod';
import { useSearchParams } from 'next/navigation';

interface Product {
    id: number;
    pictures: string[];
    name: string;
    price: string | number; 
    size: string;
}

export default function BuyPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const searchParams = useSearchParams();
    const id = searchParams?.get('id') ?? ''; 

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
                    console.error('Error fetching product:', error);
                    setError(error.message);
                } else {
                    console.error('Unexpected error:', error);
                    setError('Failed to load product due to an unexpected error');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProduct(); 
    }, [id]);

    const handleAddToCart = async () => {
        if (!product || isAddingToCart) return; // Prevent duplicates
        setIsAddingToCart(true);
        
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token'); 
        
        if (!userId) {
            alert('Please log in to add products to your cart.'); // แจ้งผู้ใช้หากยังไม่ได้ล็อกอิน
            setIsAddingToCart(false); // Reset state
            return; // ถ้าไม่มี userId ให้ยกเลิก
        }
    
        console.log('User ID:', userId); // ตรวจสอบ userId
        console.log('Product ID:', product.id); // ตรวจสอบ product ID
        console.log('Sending add to cart request:', { userId, productId: product.id });

        try {
            const response = await fetch('/api/addtocart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    userId,
                    productId: product.id, // ส่ง productId
                }),
            });
            
            if (response.status !== 201) {
                const errorData = await response.text();
                console.error('Error data from API:', errorData); // Log ข้อมูลข้อผิดพลาด
                alert('Product already in cart');
            } 
            else {
                const result = await response.json();
            console.log('Product added to cart:', result);
            alert('Product added to cart successfully!');

            }
    
            
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error adding product to cart:', error.message);
                setError(error.message); // Set error message to state for rendering
            } else {
                console.error('Unexpected error:', error);
                setError('Failed to add product to cart due to an unexpected error');
            }
        } finally {
            setIsAddingToCart(false); // Reset state after operation
>>>>>>> Stashed changes
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

<<<<<<< Updated upstream
  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return; // Prevent duplicates
    setIsAddingToCart(true);

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId) {
      alert("Please log in to add products to your cart."); // แจ้งผู้ใช้หากยังไม่ได้ล็อกอิน
      setIsAddingToCart(false); // Reset state
      return; // ถ้าไม่มี userId ให้ยกเลิก
    }

    console.log("User ID:", userId); // ตรวจสอบ userId
    console.log("Product ID:", product.id); // ตรวจสอบ product ID
    console.log("Sending add to cart request:", {
      userId,
      productId: product.id,
    });

    try {
      const response = await fetch("/api/addtocart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          userId,
          productId: product.id, // ส่ง productId
        }),
      });

      if (response.status !== 201) {
        const errorData = await response.text();
        console.error("Error data from API:", errorData); // Log ข้อมูลข้อผิดพลาด
        alert("Product already in cart");
      } else {
        const result = await response.json();
        console.log("Product added to cart:", result);
        alert("Product added to cart successfully!");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error adding product to cart:", error.message);
        setError(error.message); // Set error message to state for rendering
      } else {
        console.error("Unexpected error:", error);
        setError("Failed to add product to cart due to an unexpected error");
      }
    } finally {
      setIsAddingToCart(false); // Reset state after operation
=======
    if (loading) {
        return <div>Loading...</div>; 
    }

    if (error) {
        return <div className="error-message">{error}</div>; // Show error message to the user
>>>>>>> Stashed changes
    }
  };

<<<<<<< Updated upstream
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>; // Show error message to the user
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="flex flex-col lg:flex-row">
        {/* แสดงภาพผลิตภัณฑ์ */}
        <div className="lg:w-1/2 p-5">
          <img
            src={product.pictures?.[0] || "/default.jpg"}
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg mb-4"
          />
          <div className="flex flex-wrap">
            {product.pictures?.slice(1).map((picture, index) => (
              <img
                key={index}
                src={picture}
                alt={`${product.name} Thumbnail`}
                className="w-1/3 h-32 object-cover m-1 rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* แสดงรายละเอียดผลิตภัณฑ์ */}
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
=======
    if (!product) {
        return <div>Product not found.</div>; 
    }

    return (
        <div className="min-h-screen bg-white text-black">
          <Navbar />
          <div className="flex flex-col lg:flex-row">
            {/* แสดงภาพผลิตภัณฑ์ */}
            <div className="lg:w-1/2 p-5">
              <img
                src={product.pictures?.[0] || "/default.jpg"}
                alt={product.name}
                className="w-full h-auto object-cover rounded-lg mb-4"
              />
              <div className="flex flex-wrap">
                {product.pictures?.slice(1).map((picture, index) => (
                  <img
                    key={index}
                    src={picture}
                    alt={`${product.name} Thumbnail`}
                    className="w-1/3 h-32 object-cover m-1 rounded-lg"
                  />
                ))}
              </div>
            </div>
    
            {/* แสดงรายละเอียดผลิตภัณฑ์ */}
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
    
          <Recprod
            key={product.id}
            imageSrc={product.pictures?.[0] || "/default.jpg"}
            name={product.name}
            price={
              typeof product.price === "number"
                ? product.price.toString()
                : product.price
            }
            size={product.size || "N/A"}
          />
          <Footer />
        </div>
      );
    }
    
>>>>>>> Stashed changes
