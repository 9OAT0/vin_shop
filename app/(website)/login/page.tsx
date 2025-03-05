'use client';

import { useState } from 'react';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useRouter } from 'next/navigation';
import { HiEye, HiEyeOff } from 'react-icons/hi'; // ใช้ไอคอนจาก react-icons
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

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || 'การเข้าสู่ระบบล้มเหลว';
        throw new Error(errorMessage);
      }

      const data = await response.json();
        console.log('เข้าสู่ระบบสำเร็จ, token:', data.token);
        localStorage.setItem('token', data.token); // เก็บ token ใน localStorage
        localStorage.setItem('userId', data.user_id); // เก็บ userId ถ้าต้องการ
        localStorage.setItem('role', data.user_role)
        localStorage.setItem('Username', data.user_name)
        router.push('/');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message);
      setError(
        err.message.includes('NetworkError')
          ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ โปรดลองอีกครั้งภายหลัง'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = () => email.match(/\S+@\S+\.\S+/) !== null;

  return (
    <>
      
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
                className={` border-b border-black p-2 ${
                  !isEmailValid() && email ? 'border-red-600' : ''
                }`}
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
                  className=" border-b border-black p-2 w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 mt-2 mr-2"
                >
                  {showPassword ? <HiEyeOff size={24}/> : <HiEye size={24}/>}
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
        <div>
          <Footer />
          <Image src="/Rectangle 276.png" alt="" className="w-full h-[40px]"/>
        </div>
      </div>
    </>
  );
}