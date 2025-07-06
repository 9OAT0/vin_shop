'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetpasswordPage() {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [token, setToken] = useState<string | null>(null); // ✅ Store token in state

    // ✅ Fetch token from URL in useEffect (runs only on the client)
    useEffect(() => {
        if (typeof window !== 'undefined') { // ✅ Ensure code runs only in the browser
            const query = new URLSearchParams(window.location.search);
            setToken(query.get('token'));
        }
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            setErrorMessage("รหัสผ่านไม่ตรงกัน");
            return;
        }

        try {
            const response = await fetch('/api/resetPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
            }

            const result = await response.json();
            setSuccessMessage(result.message);
            setNewPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                router.push('/login'); // Redirect to login page after reset
            }, 2000);

        } catch (error: unknown) {
            if (error instanceof Error) {
                setErrorMessage(error.message || 'เกิดข้อผิดพลาดที่ไม่รู้จัก');
            } else {
                setErrorMessage('เกิดข้อผิดพลาดที่ไม่รู้จัก');
            }
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center gap-24">
            <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center gap-24">
                <div className="text-black flex justify-center">
                    <h1 className="text-2xl font-bold">YOUR NEW PASSWORD</h1>
                </div>
                <div className="flex flex-col gap-10">
                    <div>
                        <label className="text-black">NEW PASSWORD:</label>
                        <input 
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="border-b border-black w-full"
                            required 
                        />
                    </div>
                    <div>
                        <label className="text-black">CONFIRM YOUR NEW PASSWORD:</label>
                        <input 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="border-b border-black w-full"
                            required 
                        />
                    </div>
                </div>
                <div className="flex gap-32 justify-center items-center">
                    <button type="submit">
                        <h1 className="bg-black w-20 h-10 flex justify-center items-center text-white">SUBMIT</h1>
                    </button>
                    <a href="/forgotpassword" className="text-black">CANCEL</a>
                </div>
                {errorMessage && <p className="text-red-600">{errorMessage}</p>}
                {successMessage && <p className="text-green-600">{successMessage}</p>}
            </form>
        </div>
    );
}
