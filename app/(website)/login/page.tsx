'use client';

import { useState } from 'react';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useRouter } from 'next/navigation';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('📤 Submitting login with:', { email, password });

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ สำคัญมากสำหรับ httpOnly
        body: JSON.stringify({ email, password }),
      });

      console.log('📥 API Response:', response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log('❌ API Error Data:', errorData);
        throw new Error(errorData?.error || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ Login success data:', data);

      router.push('/');
    } catch (err: any) {
      console.error('🔥 Login Exception:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = () => /\S+@\S+\.\S+/.test(email);

  return (
    <div className="bg-white text-black min-h-screen">
      <Navbar />
      <div className='flex flex-col justify-center items-center gap-16 py-10'>
        <h1 className="text-3xl font-bold text-center">LOGIN</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label>อีเมล:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`border-b border-black p-2 ${!isEmailValid() && email ? 'border-red-600' : ''}`}
              required
            />
            {!isEmailValid() && email && (
              <p className="text-red-600">กรุณาใส่อีเมลที่ถูกต้อง</p>
            )}
          </div>
          <div className="flex flex-col">
            <label>รหัสผ่าน:</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-b border-black p-2 w-full"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 mt-2 mr-2"
              >
                {showPassword ? <HiEyeOff size={24} /> : <HiEye size={24} />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white p-2 rounded"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'SIGN IN'}
          </button>
        </form>
      </div>
      <div className="flex justify-between items-center px-[300px] py-10">
        <a href="/signin">สร้างบัญชีใหม่</a>
        <a href="/forgotpassword">ลืมรหัสผ่าน?</a>
      </div>
      <Footer />
      <Image src="/Rectangle 276.png" width={300} height={200} alt="" className="w-full h-[40px]" />
    </div>
  );
}
