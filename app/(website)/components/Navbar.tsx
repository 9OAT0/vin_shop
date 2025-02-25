import { useState, useEffect, useRef } from "react";
import axios from "axios"; // นำเข้า axios

export default function ComponentsNavbar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearchBar, setShowSearchBar] = useState(false);
    const searchBarRef = useRef<HTMLDivElement>(null); 

    const handleSearch = async () => {
        console.log("Searching for:", searchTerm);
        try {
            const response = await axios.get(`/api/products?name=${encodeURIComponent(searchTerm)}`);
            console.log("Search Results:", response.data);
            // จัดการผลลัพธ์การค้นหา เช่น นำทางไปยังหน้าแสดงผลลัพธ์ หรือแสดงผลลัพธ์
            // ตัวอย่างเช่น:
            // window.location.href = `/results?query=${encodeURIComponent(searchTerm)}`;
        } catch (error) {
            console.error("Error fetching products:", error);
            // แสดงข้อความแสดงข้อผิดพลาดถ้าต้องการ
        }
    };

    const closeSearchBar = () => {
        setShowSearchBar(false);
    };

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

    return (
        <>
            <div className="w-full h-[40px] bg-white flex justify-between items-center px-5 border-black border-[1px]">
                <a href="/"><div className="text-black"><h1>VIN_SHOP</h1></div></a>
                <div className="text-black flex justify-center items-center gap-20 pl-32"> 
                    <a href="/shopall"><h1>SHOP ALL</h1></a>
                </div>
                <div className="flex items-center gap-4 text-black"> 
                <a href="/login"><h1>LOGIN</h1></a>
                    <button onClick={() => setShowSearchBar(!showSearchBar)} className="h-8">
                        {showSearchBar ? "" : "SEARCH"}
                    </button>
                    {showSearchBar && (
                        <div className="flex gap-2" ref={searchBarRef}>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-gray-300 rounded pl-2 h-8" 
                            />
                            <button onClick={handleSearch} className="h-8">SUBMIT</button>
                        </div>
                    )}
                    <a href="/cart"><h1>CART (0)</h1></a>
                </div>
            </div>
        </>
    );
}