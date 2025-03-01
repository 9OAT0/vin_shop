import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface Product {
    pictures: any;
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

    const debounce = (func: (...args: any) => void, wait: number) => {
        let timeout: NodeJS.Timeout;
        return (...args: any) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func(...args);
            }, wait);
        };
    };
    

    const updateSuggestions = async (term: string) => {
        if (!term) {
            setSuggestions([]);
            return;
        }
    
        const token = localStorage.getItem('token');
        console.log("Authorization Token:", token);
    
        if (!token) {
            console.error("No token found. Please log in.");
            setSuggestions([]);
            return;
        }
    
        setLoading(true);
        try {
            const response = await axios.get('/api/search', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    name: term,
                },
            });
            console.log("API Response:", response.data); // Log API response for debugging
            setSuggestions(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Axios error response:", error.response); // Log detailed error response
            } else {
                console.error("Error fetching suggestions:", error);
            }
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const debouncedUpdateSuggestions = debounce(updateSuggestions, 300);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        debouncedUpdateSuggestions(term);
    };

    const closeSearchBar = () => {
        setShowSearchBar(false);
        setSearchTerm('');
        setSuggestions([]);
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
                        <div className="relative flex gap-2" ref={searchBarRef}>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchTerm}
                                onChange={handleChange}
                                className="border border-gray-300 rounded pl-2 h-8" 
                            />
                            {loading && <div className="loader">Loading...</div>}  {/* Optional loader */}
                            {suggestions.length > 0 && (
                                <div className="absolute z-4 mt-9 w-full bg-white border border-black rounded-md shadow-lg max-h-64 overflow-y-auto">
                                    {suggestions.map((product) => (
                                        <div 
                                            key={product.id}
                                            className="p-2 hover:bg-gray-200 cursor-pointer text-black"
                                            onClick={() => {
                                                setSearchTerm(product.name);
                                                setSuggestions([]); // Clear suggestions when an item is selected
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
                    <a href="/cart"><h1>CART (0)</h1></a>
                    <div>dfdf</div>
                </div>
            </div>
        </>
    );
}