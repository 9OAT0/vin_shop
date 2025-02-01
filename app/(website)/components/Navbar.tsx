export default function ComponentsNavbar() {
    return (
        <>
            <div className="w-full h-[40px] bg-white flex justify-between items-center px-5 border-black border-[1px]">
                <a href="/"><div className="text-black"><h1>VIN_SHOP</h1></div></a>
                <div className="text-black flex justify-center items-center gap-6"> 
                    <a href="/shopall"><h1>SHOP ALL</h1></a>
                    <h1>CATEGORIES</h1>
                    <h1>INFO</h1>
                    <h1>LIBRARY</h1>
                </div>
                <div className="text-black flex justify-center items-center gap-[15px]">
                    <a href="/login"><h1>LOGIN</h1></a>
                    <h1>SEARCH</h1>
                    <h1>CART (0)</h1>
                </div>
            </div>
        </>
    )
}