"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  size: string;
  price: number;
  details: string;
  pictures: File | null;
}

const EditProduct: React.FC = () => {
  const { id } = useParams(); // รับ ID จาก URL
  const [product, setProduct] = useState<Product>({
    id: "",
    name: "",
    size: "",
    price: 0,
    details: "",
    pictures: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get<Product>(`/api/product_fix/${id}`); // ดึงข้อมูลผลิตภัณฑ์
        setProduct(response.data); // อัปเดตสถานะด้วยข้อมูลที่ได้รับ
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProduct({ ...product, pictures: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("size", product.size);
    formData.append("price", product.price.toString());
    formData.append("details", product.details);
    if (product.pictures) {
      formData.append("image", product.pictures);
    }
    try {
      await axios.put(`/api/product/${product.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Product updated successfully!");
      navigate("/"); // นำทางกลับไปยังหน้าหลักหลังจากอัปเดตเสร็จ
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto", backgroundColor: "#f9f9f9", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
      <h1>Edit Product</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <label>
          Product Name:
          <input type="text" name="name" value={product.name} onChange={handleChange} required style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
        </label>
        <label>
          Size:
          <input type="text" name="size" value={product.size} onChange={handleChange} required style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
        </label>
        <label>
          Price:
          <input type="number" name="price" value={product.price} onChange={handleChange} required style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
        </label>
        <label>
          Details:
          <textarea name="details" value={product.details} onChange={handleChange} required style={{ width: "100%", padding: "8px", borderRadius: '4px', border: "1px solid #ccc" }} />
        </label>
        <label>
          Product Image:
          <input type="file" name="image" onChange={handleImageChange} style={{ marginTop: "10px" }} />
        </label>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#000",
              color: "#fff",
              padding: "10px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              flex: "1",
              marginRight: "10px",
              transition: "background-color 0.3s",
            }}
          >
            SAVE
          </button>
          <button
            type="button"
            onClick={() => navigate("/")} // นำทางกลับเมื่อคลิก Cancel
            style={{
              backgroundColor: "#ccc",
              color: "#000",
              padding: "10px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              flex: "1",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#bbb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ccc")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;