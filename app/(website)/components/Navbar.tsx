import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface Product {
    pictures: string[];
    imageUrl: string | undefined;
    id: number;
    name: string;
}

export default function ComponentsNavbar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const searchBarRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [totalProducts, setTotalProducts] = useState(0);
    const [userName, setUserName] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null); 

    // ดึงค่า localStorage บนไคลเอนต์
    useEffect(() => {
        if (typeof window !== "undefined") {
            setUserId(localStorage.getItem("username"));
            setUserName(localStorage.getItem("Username"));
        }
    }, []);

    

    // ฟังก์ชันดึงข้อมูลตะกร้าสินค้า
    const fetchCartDetails = async () => {
        if (!userId) return;
        try {
            const response = await axios.get(`/api/cart`, { params: { userId } });
            setTotalProducts(response.data.totalProducts);
        } catch (error) {
            console.error("Error fetching cart details:", error);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchCartDetails();
        }
    }, [userId]);

    // Debounce function สำหรับ search
    const debounce = (func: (...args: any) => void, wait: number) => {
        let timeout: NodeJS.Timeout;
        return (...args: any) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func(...args);
            }, wait);
        };
    };

    // ฟังก์ชันดึงคำแนะนำจาก API
    const updateSuggestions = async (term: string) => {
        if (!term) {
            setSuggestions([]);
            return;
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null; 
        if (!token) {
            console.error("No token found. Please log in.");
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get('/api/search', {
                headers: { Authorization: `Bearer ${token}` },
                params: { name: term },
            });
            setSuggestions(response.data);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const debouncedUpdateSuggestions = debounce(updateSuggestions, 300);

    // เมื่อเปลี่ยนค่าค้นหา
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        debouncedUpdateSuggestions(term);
    };

    // ปิด Search Bar
    const closeSearchBar = () => {
        setShowSearchBar(false);
        setSearchTerm('');
        setSuggestions([]);
    };

    // ปิด Search Bar เมื่อคลิกนอกกล่องค้นหา
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
                closeSearchBar();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // ฟังก์ชัน Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setUserName(null);  // ✅ รีเซ็ตค่า userName
        setUserId(null);  // ✅ รีเซ็ต userId
        setTotalProducts(0); // ✅ รีเซ็ตจำนวนสินค้าในตะกร้า

        // ✅ ใช้ setTimeout เพื่อให้ React อัปเดต UI ก่อนเปลี่ยนหน้า
        setTimeout(() => {
            window.location.href = "/login"; // ✅ ยังคงใช้ window.location.href เหมือนเดิม
        }, 100);
    };
    

    return (
        <div className="w-full h-[40px] bg-white flex justify-between items-center px-5 border-black border-[1px]">
            <a href="/"><div className="text-black"><h1>VIN_SHOP</h1></div></a>
            <div className="text-black flex justify-center items-center gap-20 pl-32">
                <a href="/shopall"><h1 className="hover:border-b-2 hover:border-black">SHOP ALL</h1></a>
            </div>
            <div className="flex items-center gap-4 text-black"> 
                {userName ? (
                    <h1>{userName}</h1>
                ) : (
                    <a href="/login"><h1 className="font-bold hover:border-b-2 hover:border-black">LOGIN</h1></a>
                )}
                <button onClick={() => setShowSearchBar(!showSearchBar)} className="hover:border-b-2 hover:border-black">
                    {showSearchBar ? "" : "SEARCH"}
                </button>
                {showSearchBar && (
                    <div className="relative flex gap-2" ref={searchBarRef}>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={handleChange}
                            className="border border-gray-300 rounded pl-2 h-8 hover:border-b-2 hover:border-black" 
                        />
                        {loading && <div className="loader">Loading...</div>}
                        {suggestions.length > 0 && (
                            <div className="absolute z-4 mt-9 w-full bg-white border border-black rounded-md shadow-lg max-h-64 overflow-y-auto">
                                {suggestions.map((product) => (
                                    <div 
                                        key={product.id}
                                        className="p-2 hover:bg-gray-200 cursor-pointer text-black"
                                        onClick={() => {
                                            setSearchTerm(product.name);
                                            setSuggestions([]);
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <img 
                                                src={product.pictures[0] || '/default.jpg'} 
                                                alt={product.name} 
                                                className="w-8 h-8 mr-2 rounded" 
                                            />
                                            {product.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <a href="/cart"><h1 className="hover:border-b-2 hover:border-black">CART ({totalProducts})</h1></a>
                <a href="/order" className="hover:border-b-2 hover:border-black">YOUR ORDER</a>
                <button className="hover:border-b-2 hover:border-black" onClick={handleLogout}>
                    LOGOUT
                </button>
            </div>
        </div>
    );
}
