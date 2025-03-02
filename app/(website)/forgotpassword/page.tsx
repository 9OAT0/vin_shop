'use client';

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import React, { useState } from 'react';

export default function ForgotpasswordPage() {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // หยุดการรีเฟรชหน้า

        try {
            const response = await fetch('/api/requrestResetPassword', { // URL นี้จะชี้ไปที่ API ที่ใช้ส่งลิงค์รีเซ็ตรหัสผ่าน
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }), // ส่ง email ไป
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'เกิดข้อผิดพลาดในการส่งอีเมล');
            }

            const result = await response.json();
            setSuccessMessage(result.message); // แสดงข้อความสำเร็จ
            setEmail(''); // ล้างฟิลด์อีเมล

        } catch (error) {
            if (error instanceof Error) {
                console.error('เกิดข้อผิดพลาด:', error);
                setErrorMessage(error.message); // ใช้ message ของข้อผิดพลาด
            } else {
                console.error('เกิดข้อผิดพลาดที่ไม่รู้จัก:', error);
                setErrorMessage('เกิดข้อผิดพลาดที่ไม่รู้จัก');
            }
        }
    };

    return (
        <>
            <div className="min-h-screen bg-white text-black flex flex-col gap-16">
                <Navbar />
                <div className="flex flex-col gap-4 p-[37px]">
                    <h1 className='text-3xl font-bold text-center pr-[0px]'>RESET YOUR PASSWORD</h1>
                    <h1 className='text-xl font-bold text-center pr-[0px]'>We will send you an email to reset your password.</h1>
                </div>
                <div className="flex flex-col justify-center items-center">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-28">
                        <div className="flex flex-col">
                            <label>EMAIL</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} 
                                className="border-b border-black w-[400px] h-10" 
                                required 
                            />
                        </div>
                        <div className="pr-[0px] flex items-center gap-28">
                            <button type="submit" className="bg-black text-white w-[125px] h-[40px] flex justify-center items-center">
                                <div>SUBMIT</div>
                            </button>
                            <a href="/login">Cancel</a>
                        </div>
                        {errorMessage && <p className="text-red-600">{errorMessage}</p>} {/* แสดงข้อความข้อผิดพลาด */}
                        {successMessage && <p className="text-green-600">{successMessage}</p>} {/* แสดงข้อความสำเร็จ */}
                    </form>
                </div>
                <div>
                    <Footer />
                    <img src="/Rectangle 276.png" alt="" className="w-full h-[40px]" />
                </div>
            </div>
        </>
    );
}