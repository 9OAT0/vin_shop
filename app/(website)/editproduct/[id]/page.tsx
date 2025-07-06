/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  size: string;
  description: string;
  pictures: string[]; // ✅ รองรับหลายรูป
}

export default function EditProductPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id; // ✅ แปลงให้เป็น string แน่นอน
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]); // ✅ เก็บรูปภาพที่อัปโหลด
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    size: "",
    description: "",
  });

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        console.log("📢 Fetching product with ID:", id);

        const token = localStorage.getItem("token");
        if (!token) throw new Error("❌ No token found. Please login.");

        const response = await fetch(`/api/product_fix/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error(`❌ Failed to fetch product: ${response.statusText}`);

        const data: Product = await response.json();
        setProduct(data);
        setPreviewImages(data.pictures || []); // ✅ แสดงรูปเดิมก่อนอัปโหลดใหม่
        setFormData({
          name: data.name || "",
          price: data.price.toString() || "",
          size: data.size || "",
          description: data.description || "",
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
        console.error("❌ Error fetching product:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ✅ อัปเดตสินค้าและเพิ่มรูปภาพหลายรูป
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateFormData = new FormData();
    updateFormData.append("name", formData.name);
    updateFormData.append("price", formData.price);
    updateFormData.append("size", formData.size);
    updateFormData.append("description", formData.description);

    // ✅ ส่งเฉพาะรูปภาพที่ไม่ถูกลบ
    previewImages.forEach((img) => {
      updateFormData.append("pictures", img);
    });

    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        updateFormData.append("pictures", selectedFiles[i]); // ✅ รองรับหลายรูป
      }
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("❌ No token found. Please login.");

      const response = await fetch(`/api/product_fix/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ ต้องส่ง Token
        },
        body: updateFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`❌ Failed to update product: ${errorData.error || response.statusText}`);
      }

      const updatedProduct = await response.json();
      setProduct(updatedProduct);
      setPreviewImages(updatedProduct.pictures || []); // ✅ แสดงรูปใหม่หลังอัปเดตสำเร็จ
      alert("✅ Updated successfully!");
      router.push(`/product/${id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert("❌ Error updating product: " + err.message);
    }
  };

  // ✅ จัดการการเปลี่ยนค่าฟอร์ม
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ แสดงตัวอย่างรูปภาพที่อัปโหลด
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(files);

      // ✅ แปลงไฟล์เป็น URL เพื่อแสดง Preview
      const previews = Array.from(files).map(file => URL.createObjectURL(file));
      setPreviewImages([...previewImages, ...previews]);
    }
  };

  // ✅ ลบรูปภาพที่อัปโหลดผิด
  const handleRemoveImage = (index: number) => {
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">❌ {error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">✏️ แก้ไขสินค้า</h1>

      {/* ✅ แสดงรูปภาพเดิม + รูปที่อัปโหลดใหม่ พร้อมปุ่มลบ */}
      {previewImages.length > 0 && (
        <div className="mt-4 flex gap-4 flex-wrap">
          {previewImages.map((pic, index) => (
            <div key={index} className="relative">
              <Image src={pic} alt="Product Preview" className="w-32 h-32 object-cover rounded" />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded-full"
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleUpdate}>
        <input
          type="text"
          name="name"
          placeholder="ชื่อสินค้า"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="price"
          placeholder="ราคา"
          value={formData.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="size"
          placeholder="ขนาด"
          value={formData.size}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <textarea
          name="description"
          placeholder="คำอธิบายสินค้า"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        
        {/* ✅ อัปโหลดรูปภาพได้หลายรูป */}
        <input type="file" multiple onChange={handleFileChange} className="w-full p-2 border rounded" />

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          ✅ บันทึกการเปลี่ยนแปลง
        </button>
      </form>

      <div className="mt-4 flex gap-4">
        <button onClick={() => router.push(`/product/${id}`)} className="text-blue-500 underline">
          🔙 กลับไปที่หน้าสินค้า
        </button>
      </div>
    </div>
  );
}
