"use client";

import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useRouter } from 'next/navigation';

interface ProductFormData {
  name: string;
  price: number;
  size: string;
  description: string;
  pictures: File[];
}

const ProductUpload: React.FC = () => {
  const { register, handleSubmit, reset, setValue, getValues } = useForm<ProductFormData>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]); // ✅ แสดงรูป Preview
  const router = useRouter();

  // ✅ อัปเดต `pictures` ให้เป็น Array ที่ `react-hook-form` เข้าใจ
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const existingFiles = getValues("pictures") || []; // ✅ ดึงค่ารูปที่เลือกก่อนหน้า
      const newFiles = Array.from(files);

      // ✅ จำกัดให้เลือกได้สูงสุด 5 รูป
      if (existingFiles.length + newFiles.length > 5) {
        setMessage("❌ คุณสามารถอัปโหลดได้สูงสุด 5 รูปเท่านั้น!");
        return;
      }

      const updatedFiles = [...existingFiles, ...newFiles]; // ✅ รวมรูปที่เลือกใหม่กับรูปที่เลือกก่อนหน้า
      setValue("pictures", updatedFiles);

      // ✅ อัปเดต Preview
      const previewArray = updatedFiles.map((file) => URL.createObjectURL(file));
      setPreviewImages(previewArray);
    }
  };

  // ✅ ฟังก์ชันลบรูปที่เลือกก่อนอัปโหลด
  const handleRemoveImage = (index: number) => {
    const updatedFiles = getValues("pictures").filter((_, i) => i !== index); // ✅ เอารูปที่ไม่ต้องการออก
    setValue("pictures", updatedFiles);

    // ✅ อัปเดต Preview
    const previewArray = updatedFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages(previewArray);
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", data.price.toString());
      formData.append("size", data.size);
      formData.append("description", data.description);

      // ✅ ส่งหลายรูปไปยัง API
      data.pictures.forEach((file) => {
        formData.append("pictures", file);
      });

      const token = localStorage.getItem("token");

      await axios.post("/api/Product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("✅ อัปโหลดสินค้าสำเร็จ!");
      router.push('/admin');
      setPreviewImages([]); // ✅ ล้างภาพตัวอย่างเมื่ออัปโหลดสำเร็จ
      reset();
    } catch (error) {
      console.error("❌ Error uploading product:", error);
      setMessage("❌ เกิดข้อผิดพลาดในการอัปโหลดสินค้า");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center text-black">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">📦 เพิ่มสินค้าใหม่</h1>

        {message && (
          <div
            className={`p-3 mb-4 rounded ${
              message.includes("✅") ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ชื่อสินค้า */}
          <div>
            <label className="block font-semibold">ชื่อสินค้า</label>
            <input
              type="text"
              {...register("name", { required: true })}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* ราคา */}
          <div>
            <label className="block font-semibold">ราคา (฿)</label>
            <input
              type="number"
              {...register("price", { required: true })}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* ขนาด */}
          <div>
            <label className="block font-semibold">ขนาด</label>
            <select {...register("size", { required: true })} className="w-full p-2 border border-gray-300 rounded">
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>

          {/* คำอธิบาย */}
          <div>
            <label className="block font-semibold">คำอธิบาย</label>
            <textarea
              {...register("description", { required: true })}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* อัปโหลดรูป */}
          <div>
            <label className="block font-semibold">อัปโหลดรูปภาพ (สูงสุด 5 รูป)</label>
            <input
              type="file"
              className="w-full p-2 border border-gray-300 rounded"
              accept="image/png, image/jpeg, image/jpg"
              multiple
              required
              onChange={handleFileChange} // ✅ อัปเดตรูปที่เลือก
            />
            {getValues("pictures")?.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">📸 เลือกรูปภาพแล้ว {getValues("pictures").length} รูป</p>
            )}
          </div>

          {/* ✅ แสดงตัวอย่างรูปภาพ (และปุ่มลบ) */}
          {previewImages.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {previewImages.map((src, index) => (
                <div key={index} className="relative">
                  <Image src={src} alt={`preview-${index}`} width={300} height={200} className="w-16 h-16 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-full hover:bg-red-800"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ปุ่มอัปโหลด */}
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "⏳ กำลังอัปโหลด..." : "📤 อัปโหลดสินค้า"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductUpload;
