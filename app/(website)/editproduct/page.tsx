"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";


interface Product {
  id: string;
  name: string;
  size: string;
  price: number;
  details: string;
  pictures: File | null;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const [productId, setProductId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [product, setProduct] = useState<Product>({
    id: "",
    name: "",
    size: "",
    price: 0,
    details: "",
    pictures: null,
  });

  // ✅ ดึง `authToken` และ `productId` หลังจาก Component โหลดแล้ว
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setAuthToken(localStorage.getItem("token"));
      setProductId(params?.id as string);
    }
  }, [params?.id]);

  // ✅ ดึงข้อมูลสินค้า หลังจากที่ productId และ authToken โหลดเสร็จแล้ว
  useEffect(() => {
    if (!productId || !authToken || !isClient) return;

    const fetchProduct = async () => {
      try {
        console.log("Fetching product with ID:", productId);
        const response = await axios.get<Product>(`/api/product_fix/${productId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setProduct(response.data);
      } catch (error) {
        console.error("❌ Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [productId, authToken, isClient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProduct({ ...product, pictures: e.target.files[0] });
    }
  };

  // ✅ ฟังก์ชันส่งข้อมูลไปยัง API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) {
      alert("❌ Product ID is missing!");
      return;
    }
    if (!authToken) {
      alert("❌ Authorization token is missing!");
      return;
    }

    const formData = new FormData();
    formData.append("id", productId);
    formData.append("name", product.name);
    formData.append("size", product.size);
    formData.append("price", product.price.toString());
    formData.append("details", product.details);
    if (product.pictures) {
      formData.append("image", product.pictures);
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/api/product_fix/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      });
      console.log("✅ Product updated:", response.data);
      alert("✅ Product updated successfully!");
    } catch (error) {
      console.error("❌ Error updating product:", error);
      alert("❌ Failed to update product!");
    }

    router.push("/");
  };

  // ✅ แสดงผลเฉพาะตอนที่ Component โหลดเสร็จแล้ว
  if (!isClient || !productId) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Edit Product</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Product Name:
          <input type="text" name="name" value={product.name} onChange={handleChange} required />
        </label>
        <label>
          Size:
          <input type="text" name="size" value={product.size} onChange={handleChange} required />
        </label>
        <label>
          Price:
          <input type="number" name="price" value={product.price} onChange={handleChange} required />
        </label>
        <label>
          Details:
          <textarea name="details" value={product.details} onChange={handleChange} required />
        </label>
        <label>
          Product Image:
          <input type="file" name="image" onChange={handleImageChange} />
        </label>
        <div>
          <button type="submit">SAVE</button>
          <button type="button" onClick={() => router.push("/")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
