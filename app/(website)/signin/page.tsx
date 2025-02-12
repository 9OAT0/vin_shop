'use client';

import { useState } from 'react';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/singup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    firstName,  // ส่ง firstName
                    lastName,   // ส่ง lastName
                    email,
                    password,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text(); // รับข้อมูลเป็น text เพื่อตรวจสอบ
                throw new Error(errorText || 'Sign up failed');
            }

            const data = await response.json();
            console.log('User signed up successfully:', data.message);

            // เปลี่ยนเส้นทางไปยังหน้า login
            router.push('/');

        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error('Error:', err.message);
                setError(err.message);
            } else {
                console.error('Unexpected error:', err);
                setError('An unexpected error occurred.');
            }
        } finally {
            setLoading(false); // เปลี่ยนสถานะ loading ให้ false
        }
    };

    const isEmailValid = () => /\S+@\S+\.\S+/.test(email);

    return (
        <>
            <Navbar />
            <div className="bg-white text-black min-h-screen p-[37px] flex flex-col gap-16">
                <h1 className='text-3xl font-bold text-center'>CREATE ACCOUNT</h1>
                <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center gap-28">
                    <div className="flex flex-col justify-center items-center gap-8">
                        <div className="flex flex-col">
                            <label htmlFor="first-name">FIRST NAME</label>
                            <input 
                                type="text" 
                                id="first-name" 
                                value={firstName} 
                                onChange={(e) => setFirstName(e.target.value)} 
                                className="w-[400px] h-[40px] border-[1px] border-b border-black" 
                                required 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="last-name">LAST NAME</label>
                            <input 
                                type="text" 
                                id="last-name" 
                                value={lastName} 
                                onChange={(e) => setLastName(e.target.value)} 
                                className="w-[400px] h-[40px] border-[1px] border-b border-black" 
                                required 
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="email">EMAIL</label>
                            <input 
                                type="email" 
                                id="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className={`w-[400px] h-[40px] border-[1px] border-b border-black ${!isEmailValid() && email ? 'border-red-600' : ''}`} 
                                required 
                            />
                            {!isEmailValid() && email && (
                                <p className="text-red-600">Please enter a valid email address.</p>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="password">PASSWORD</label>
                            <input 
                                type="password" 
                                id="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="w-[400px] h-[40px] border-[1px] border-b border-black" 
                                required 
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-600">{error}</p>}
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="bg-black text-white w-[125px] h-[40px] flex justify-center items-center"
                    >
                        {loading ? 'Creating...' : 'CREATE'}
                    </button>
                    <div className='border-black border-b'>
                        <a href="/login" className="text-black">SIGN IN</a>
                    </div>
                </form>
            </div>
            <Footer />
        </>
    );
}