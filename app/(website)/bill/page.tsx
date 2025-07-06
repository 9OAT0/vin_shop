/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import React, { useState } from 'react';
import Link from "next/link";

// กำหนดประเภทข้อผิดพลาด (ถ้าต้องการ)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AppError = {
    message: string;
};

const Receipt = () => {
    const paymentDetails = {
        transactionId: '123456789',
        date: '02/10/2025',
        amount: '1000.00 THB',
        paymentMethod: 'Credit Card',
        recipient: 'Jhon Doe',
    };

    const [errorMessage, setErrorMessage] = useState('');
    
    const handleOrderCreation = async () => {
        try {
            const response = await fetch('/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: 'yourUserId' }),  // เปลี่ยนเป็น userId ที่แท้จริง
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'เกิดข้อผิดพลาด');  // สร้างข้อผิดพลาดถ้าเก็บข้อมูลไม่ถูกต้อง
            }

            const result = await response.json();
            console.log('สร้างคำสั่งซื้อสำเร็จ:', result.orders);

        } catch (error) {
            if (error instanceof Error) {
                console.error('เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ:', error);
                setErrorMessage(error.message);  // ใช้ message ของข้อผิดพลาด
            } else {
                console.error('เกิดข้อผิดพลาดที่ไม่รู้จัก:', error);
                setErrorMessage('เกิดข้อผิดพลาดที่ไม่รู้จัก');
            }
        }
    };

    return (
        <>
            <div className="p-[20px] max-w-[600px] m-auto border-[1px] border-black text-black flex flex-col gap-6 mt-5" style={{ backgroundImage: "url('anime.jpg')" }}>
                <h2>ใบเสร็จการชำระเงิน</h2>
                <p><strong>หมายเลขการทำรายการ:</strong> {paymentDetails.transactionId}</p>
                <p><strong>วันที่:</strong> {paymentDetails.date}</p>
                <p><strong>จำนวนเงิน:</strong> {paymentDetails.amount}</p>
                <p><strong>ช่องทางการชำระเงิน:</strong> {paymentDetails.paymentMethod}</p>
                <p><strong>ผู้ทำรายการ:</strong> {paymentDetails.recipient}</p>
                <p>ขอบคุณที่ใช้บริการของเรา</p>
                {errorMessage && <p className="text-red-600">{errorMessage}</p>}  {/* แสดงข้อความข้อผิดพลาด */}

                <button onClick={handleOrderCreation} className="border py-2 px-4 bg-blue-500 text-white hover:bg-blue-700">
                    ยืนยันคำสั่งซื้อ
                </button>
            </div>
            <div className="text-black flex justify-center items-center py-4">
                <div className="text-xl">
                    <Link href="/">ปิด</Link>
                </div>
            </div>
        </>
    );
};

export default function BillPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <Receipt /> {/* เรียกใช้ Component Receipt ที่นี่ */}
            <Footer />
        </div>
    );
}