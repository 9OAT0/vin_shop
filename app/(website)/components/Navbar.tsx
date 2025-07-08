'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get<{ user: User }>('/api/me', { withCredentials: true });
        console.log('✅ User fetched:', res.data.user);
        setUser(res.data.user);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('❌ Not Authenticated:', err);
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/Logout', {}, { withCredentials: true });
      console.log('✅ Logged out');
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    } catch (err) {
      console.error('❌ Logout failed:', err);
    }
  };

  return (
    <nav className="w-full bg-white border-b border-black px-5 py-2 flex justify-between items-center">
      <a href="/" className="text-lg font-bold">VIN_SHOP</a>
      <div className="flex gap-4">
        <a href="/shopall">SHOP ALL</a>
        {isAuthenticated ? (
          <>
            <a href="/dashBord"><span>{user?.name}</span></a>
            <button onClick={handleLogout}>LOGOUT</button>
          </>
        ) : (
          <a href="/login">LOGIN</a>
        )}
      </div>
    </nav>
  );
}
