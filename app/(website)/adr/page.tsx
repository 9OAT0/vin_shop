"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function AdrPage() {
    const [address, setAddress] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    // ✅ โหลด Token จาก LocalStorage เมื่อ Component โหลดเสร็จ
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        console.log("🔍 Loaded token:", storedToken); // Debug token
        setToken(storedToken ? `Bearer ${storedToken}` : null);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            if (!token) {
                throw new Error("Unauthorized: No token available");
            }

            console.log("📡 Sending PUT request to API...");
            console.log({ fullName, phone, address });

            const response = await axios.put(
                "/api/userFix",
                { address, fullName, phone },
                {
                    headers: {
                        Authorization: token, // ✅ ใช้ Token ที่โหลดจาก LocalStorage
                    },
                }
            );

            console.log("✅ API Response:", response.data);
            router.push("/");
        } catch (err: any) {
            console.error("❌ Error:", err.response?.data || err.message);
            setErrorMessage(err.response?.data?.error || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-white text-black flex justify-center items-center">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 border rounded-lg">
                    <h1 className="text-2xl font-bold">Update Your Details</h1>

                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        required 
                        className="border p-2 rounded" 
                    />
                    <input 
                        type="tel" 
                        placeholder="Phone Number" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        required 
                        className="border p-2 rounded" 
                    />
                    <input 
                        type="text" 
                        placeholder="Address" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        required 
                        className="border p-2 rounded" 
                    />

                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}

                    <div className="flex gap-4">
                        <button 
                            type="submit" 
                            className={`bg-blue-500 text-white p-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update"}
                        </button>
                        <Link href="/" className="bg-red-500 text-white p-2 rounded">Cancel</Link>
                    </div>
                </form>
            </div>
        </>
    );
}
