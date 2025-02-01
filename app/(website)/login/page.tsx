'use client';

import { useState } from 'react';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useRouter } from 'next/navigation';
import { HiEye, HiEyeOff } from 'react-icons/hi'; // ใช้ไอคอนจาก react-icons

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
        const errorMessage = errorData?.error || 'Login failed';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login successful, token:', data.token);
      localStorage.setItem('token', data.token);
      router.push('/');
    } catch (err: any) {
      console.error(err.message);
      setError(
        err.message.includes('NetworkError')
          ? 'Network error, please try again later.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = () => /\S+@\S+\.\S+/.test(email);

  return (
    <>
      <Navbar />
      <div className="bg-white text-black flex flex-col justify-center items-center gap-32 min-h-screen">
        <div>
          <h1 className="text-3xl font-bold text-center">Login</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`border-[1px] border-b border-black p-2 ${
                  !isEmailValid() && email ? 'border-red-600' : ''
                }`}
                required
              />
              {!isEmailValid() && email && (
                <p className="text-red-600">Please enter a valid email address.</p>
              )}
            </div>
            <div className="flex flex-col">
              <label>Password:</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[1px] border-b border-black p-2 w-full"
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
              className="bg-blue-500 text-white p-2 rounded"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
        <div className="flex justify-between items-center gap-[600px]">
          <a href="/signin">CREATE ACCOUNT</a>
          <a href="/forgotpassword">FORGOT YOUR PASSWORD</a>
        </div>
      </div>
      <Footer />
    </>
  );
}