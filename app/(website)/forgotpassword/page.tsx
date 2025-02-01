import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function ForgotpasswordPage() {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-white text-black flex flex-col gap-16 p-[37px]">
                <div className="flex flex-col gap-4">
                    <h1 className='text-3xl font-bold text-center pr-[240px]'>RESET YOUR PASSWORD</h1>
                    <h1 className='text-xl font-bold text-center pr-[140px]'>We will send you an email to reset your password.</h1>
                </div>
                <div className="flex flex-col justify-center items-center">
                    <form className="flex flex-col gap-28">
                        <div className="flex flex-col">
                            <label>EMAIL</label>
                            <input type="email" className="border-[1px] border-b border-black w-[400px] h-10" required />
                        </div>
                        <div className="pr-[332px] flex items-center gap-28">
                            <button type="submit" className="bg-black text-white w-[125px] h-[40px] flex justify-center items-center">
                                <div>CREATE</div>
                            </button>
                            <a href="/login">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    )
}