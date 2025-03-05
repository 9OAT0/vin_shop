import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Product {
    pictures: string[];
    id: number;
    name: string;
}

export default function ComponentsNavbar() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const searchBarRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [totalProducts, setTotalProducts] = useState(0);
    const [userName, setUserName] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ เช็คว่าผู้ใช้ล็อกอินหรือไม่

    // ดึงค่า localStorage และตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUserId = localStorage.getItem("userId");
            const storedRole = localStorage.getItem("role");
            const storedUserName = localStorage.getItem("Username");

            setUserId(storedUserId);
            setUserName(storedUserName);
            setRole(storedRole);
            setIsAuthenticated(!!storedUserId && !!storedRole); // ✅ อัปเดตสถานะล็อกอิน
        }
    }, []);

    // ฟังก์ชันดึงข้อมูลตะกร้าสินค้า
    const fetchCartDetails = async () => {
        if (!userId) return;
        try {
            const response = await axios.get(`/api/getCartDetails`, { params: { userId } });
            setTotalProducts(response.data.totalProducts || 0);
        } catch (error) {
            console.error("❌ Error fetching cart details:", error);
            setTotalProducts(0);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchCartDetails();
        }
    }, [userId]);

    // ฟังก์ชัน debounce สำหรับ search
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

        const token = localStorage.getItem('token');
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

    // ✅ ฟังก์ชันไปที่หน้ารายละเอียดสินค้าแบบ dynamic route
    const handleSelectProduct = (product: Product) => {
        setSearchTerm(product.name);
        setSuggestions([]);
        router.push(`/product/${product.id}`);
    };

    // ✅ ฟังก์ชัน Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("Username");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        setUserName(null);
        setUserId(null);
        setRole(null);
        setIsAuthenticated(false);
        setTotalProducts(0);

        setTimeout(() => {
            router.push("/login");
        }, 100);
    };

    return (
        <div className="w-full h-[40px] bg-white flex justify-between items-center px-5 border-black border-[1px]">
            <a href="/"><h1 className="text-black">VIN_SHOP</h1></a>
            <div className="text-black flex justify-center items-center gap-10 pl-[350px]">
                <a href="/shopall"><h1 className="hover:border-b-2 hover:border-black">SHOP ALL</h1></a>
                <a href="/adr"><h1 className="hover:border-b-2 hover:border-black">Add Your Address</h1></a>
            </div>
            <div className="flex items-center gap-4 text-black"> 
                {userName ? <h1>{userName}</h1> : <a href="/login" className="hover:border-b-2 hover:border-black">LOGIN</a>}
                <button onClick={() => setShowSearchBar(!showSearchBar)} className="hover:border-b-2 hover:border-black">SEARCH</button>
                {showSearchBar && (
                    <div className="relative flex gap-2" ref={searchBarRef}>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={handleChange}
                            className="border border-gray-300 rounded pl-2 h-8" 
                        />
                        {loading && <div className="loader">Loading...</div>}
                        {suggestions.length > 0 && (
                            <div className="absolute z-10 mt-9 bg-white border border-black rounded-md shadow-lg max-h-64 overflow-y-auto">
                                {suggestions.map((product) => (
                                    <div 
                                        key={product.id}
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => handleSelectProduct(product)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <img 
                                                src={product.pictures[0] || '/default.jpg'} 
                                                alt={product.name} 
                                                className="w-8 h-8 rounded" 
                                            />
                                            {product.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {isAuthenticated && (
                    <div className="flex items-center gap-4 text-black">
                        <a href="/cart"><h1 className="hover:border-b-2 hover:border-black">CART ({totalProducts})</h1></a>
                        {role === "ADMIN" ? (
                            <a href="/dashBord" className="hover:border-b-2 hover:border-black">DASHBOARD</a>
                        ) : (
                            <a href="/order" className="hover:border-b-2 hover:border-black">YOUR ORDER</a>
                        )}
                        <button className="hover:border-b-2 hover:border-black" onClick={handleLogout}>
                            LOGOUT
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
