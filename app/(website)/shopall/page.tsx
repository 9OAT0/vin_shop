import ProductCardd from '../components/ProductCardd';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar"

const products = [
  { imageSrc: "/image.png", name: "Shirt", price: "4,000 ฿", size: "XL" },
  { imageSrc: "/image1.png", name: "Shirt", price: "4,000 ฿", size: "XL" },
  { imageSrc: "/image2.png", name: "Shirt", price: "4,000 ฿", size: "XL" },
  { imageSrc: "/image3.png", name: "Shirt", price: "4,000 ฿", size: "XL" },
];

export default function ShopallPage() {
  return (
    <>
      <Navbar />
      <div className="w-full h-[40px] bg-white flex justify-between items-center px-5 border-black border-[1px]">
        <a href=""><div className="text-black"><h1>FILTER</h1></div></a>
        <a href=""><div className="text-black"><h1>SORT</h1></div></a>
      </div>
      <div className="flex">
        {products.map((product, index) => (
          <ProductCardd
            key={index}
            imageSrc={product.imageSrc}
            name={product.name}
            price={product.price}
            size={product.size}
          />
        ))}
      </div>
      <div className="flex">
        {products.map((product, index) => (
          <ProductCardd
            key={index}
            imageSrc={product.imageSrc}
            name={product.name}
            price={product.price}
            size={product.size}
          />
        ))}
      </div>
      <div className="flex">
        {products.map((product, index) => (
          <ProductCardd
            key={index}
            imageSrc={product.imageSrc}
            name={product.name}
            price={product.price}
            size={product.size}
          />
        ))}
      </div>
      <div className="flex">
        {products.map((product, index) => (
          <ProductCardd
            key={index}
            imageSrc={product.imageSrc}
            name={product.name}
            price={product.price}
            size={product.size}
          />
        ))}
      </div>
      <div className="flex">
        {products.map((product, index) => (
          <ProductCardd
            key={index}
            imageSrc={product.imageSrc}
            name={product.name}
            price={product.price}
            size={product.size}
          />
        ))}
      </div>
      <div className="flex">
        {products.map((product, index) => (
          <ProductCardd
            key={index}
            imageSrc={product.imageSrc}
            name={product.name}
            price={product.price}
            size={product.size}
          />
        ))}
      </div>
      <div className="flex">
        {products.map((product, index) => (
          <ProductCardd
            key={index}
            imageSrc={product.imageSrc}
            name={product.name}
            price={product.price}
            size={product.size}
          />
        ))}
      </div>
      <div className="flex">
        {products.map((product, index) => (
          <ProductCardd
            key={index}
            imageSrc={product.imageSrc}
            name={product.name}
            price={product.price}
            size={product.size}
          />
        ))}
      </div>
      <Footer />
    </>
  )
}