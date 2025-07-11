"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function AdrPage() {
  const [location, setLocation] = useState(""); // 📝 แก้ชื่อ field ให้ตรง backend
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get<{ user: { role: string } }>(
          "/api/me",
          { withCredentials: true }
        );

        const user = res.data.user;
        console.log("✅ User loaded:", user);

        if (user.role === "ADMIN") {
          console.log("👑 Admin detected → Redirecting to /dashBord");
          router.push("/dashBord");
        }
      } catch (err) {
        console.error("❌ Error fetching user info:", err);
      }
    };

    fetchUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const payload = {
      location,      // ✅ ชื่อ field ตรงกับ backend
      name,
      phoneNumber,
    };

    try {
      console.log("📦 Submitting form with data:", payload);

      const response = await axios.put(
        "/api/userFix",
        payload,
        { withCredentials: true }
      );

      console.log("✅ API Response (200):", response.data);
      router.push("/"); // ✅ Redirect home
    } catch (err: any) {
      if (err?.response) {
        console.error("❌ API Error Details:", {
          message: err?.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setErrorMessage(
          err.response?.data?.error || "Failed to update user information."
        );
      } else {
        console.error("❌ Unexpected Error:", err);
        setErrorMessage("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-black flex justify-center items-center">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 p-6 border rounded-lg shadow-md w-full max-w-md"
        >
          <h1 className="text-2xl font-bold">Update Your Details</h1>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border p-2 rounded"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="border p-2 rounded"
          />

          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              className={`bg-blue-500 text-white px-4 py-2 rounded ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
            <Link
              href="/"
              className="bg-red-500 text-white px-4 py-2 rounded text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}