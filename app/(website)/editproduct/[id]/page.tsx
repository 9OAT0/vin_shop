"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [authToken, setAuthToken] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [product, setProduct] = useState({
    name: "",
    size: "",
    price: "",
    description: "",
    pictures: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    setAuthToken(token);
  }, []);

  // ✅ ดึงข้อมูลสินค้าเดิมจาก API
  useEffect(() => {
    if (!params.id) return;

    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/product_fix/${params.id}`);

        let pictures = response.data.pictures;

        if (typeof pictures === "string") {
          try {
            pictures = JSON.parse(pictures);
          } catch (error) {
            console.error("❌ Failed to parse pictures JSON:", error.message);
            pictures = [pictures];
          }
        }

        setProduct({ ...response.data, pictures });
      } catch (error) {
        console.error("❌ Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [params.id]);

  // ✅ ฟังก์ชันอัปเดตค่าข้อมูลสินค้า
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  // ✅ ฟังก์ชันอัปโหลดรูป
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    multiple: true,
    maxFiles: 5, // ✅ จำกัดให้เลือกได้สูงสุด 5 รูป
    onDrop: (acceptedFiles) => {
      if (product.pictures.length + acceptedFiles.length > 5) {
        alert("❌ You can only upload up to 5 images.");
        return;
      }
      setSelectedFiles([...selectedFiles, ...acceptedFiles]);
      setProduct({
        ...product,
        pictures: [
          ...product.pictures,
          ...acceptedFiles.map((file) => URL.createObjectURL(file)),
        ],
      });
    },
  });

  // ✅ ฟังก์ชันลบรูปภาพจากรายการ
  const handleRemoveImage = (index) => {
    const updatedPictures = [...product.pictures];
    updatedPictures.splice(index, 1);
    setProduct({ ...product, pictures: updatedPictures });

    if (index < selectedFiles.length) {
      const updatedFiles = [...selectedFiles];
      updatedFiles.splice(index, 1);
      setSelectedFiles(updatedFiles);
    }
  };

  // ✅ ฟังก์ชันส่งข้อมูลไป API
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("size", product.size);
    formData.append("price", product.price);
    formData.append("description", product.description);

    // ✅ ถ้ามีรูปใหม่ให้ใช้ selectedFiles
    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => formData.append("pictures", file));
    } else {
      product.pictures.forEach((url) => formData.append("pictures", url));
    }

    try {
      await axios.put(`/api/product_fix/${params.id}`, formData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      alert("✅ Product updated successfully!");
      router.push("/admin");
    } catch (error) {
      console.error("❌ Error updating product:", error);
      alert("❌ Failed to update product!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-4">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block font-semibold">Product Name:</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Size */}
        <div>
          <label className="block font-semibold">Size:</label>
          <input
            type="text"
            name="size"
            value={product.size}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block font-semibold">Price ($):</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold">Details:</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Product Images */}
        <div>
          <label className="block font-semibold">Product Images:</label>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className="mt-2 p-4 border-2 border-dashed rounded-md cursor-pointer text-center bg-gray-100"
          >
            <input {...getInputProps()} />
            <p>Drag & drop images here, or click to select</p>
          </div>

          {/* ✅ แสดงพรีวิวรูปภาพ */}
          <div className="flex flex-wrap gap-2 mt-3">
            {product.pictures.map((pic, index) => (
              <div key={index} className="relative">
                <img
                  src={pic}
                  alt="Product"
                  className="w-20 h-20 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 py-0.5 rounded-md"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="px-4 py-2 bg-gray-500 text-white rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
