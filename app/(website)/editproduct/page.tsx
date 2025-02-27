"use client";

import React, { useState } from "react";
import axios from "axios";

interface Product {
  id: string;
  name: string;
  size: string;
  price: number;
  details: string;
  image: File | null;
}

const EditProduct: React.FC = () => {
  const [product, setProduct] = useState<Product>({
    id: "",
    name: "",
    size: "",
    price: 0,
    details: "",
    image: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProduct({ ...product, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add logic to submit the product data to API
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("size", product.size);
    formData.append("price", product.price.toString());
    formData.append("details", product.details);
    if (product.image) {
      formData.append("image", product.image);
    }
    try {
      await axios.put(`/api/product/${product.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Edit Product</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Product Name:
          <input type="text" name="name" value={product.name} onChange={handleChange} required /><br/>
        </label>
        <label>
          Size:
          <input type="text" name="size" value={product.size} onChange={handleChange} required /><br/>
        </label>
        <label>
          Price:
          <input type="number" name="price" value={product.price} onChange={handleChange} required /><br/>
        </label>
        <label>
          Details:  
          <textarea name="details" value={product.details} onChange={handleChange} required /><br/>
        </label>
        <label>
          Product Image:  
          <input type="file" name="image" onChange={handleImageChange} />
        </label>
        <div>
          <button type="submit" style={{ marginRight: "10px", backgroundColor: "#000", color: "#fff", padding: "10px" }}>SAVE</button>
          <button type="button" onClick={() => alert('Canceled')} style={{ backgroundColor: "#ccc", color: "#000", padding: "10px" }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;