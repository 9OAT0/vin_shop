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
        const fetchedUser = res.data.user;

        setUser(fetchedUser);
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

  const handleUserClick = () => {
    if (!user) return;
    if (user.role === 'ADMIN') {
      router.push('/dashBord'); // 🔥 Admin → Dashboard
    } else {
      router.push('/adr'); // 🔥 Non-admin → Add Location
    }
  };

  return (
    <nav className="w-full bg-white border-b border-black px-5 py-2 flex justify-between items-center">
      <a href="/" className="text-lg font-bold">VIN_SHOP</a>
      <div className="flex gap-4">
        <a href="/shopall">SHOP ALL</a>
        <a href="/cart">CART</a>
        {isAuthenticated ? (
          <>
            <button
              onClick={handleUserClick}
              className="font-semibold hover:underline"
            >
              {user?.name}
            </button>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:underline"
            >
              LOGOUT
            </button>
          </>
        ) : (
          <a href="/login">LOGIN</a>
        )}
      </div>
    </nav>
  );
}
