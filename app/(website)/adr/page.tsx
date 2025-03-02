export default function AdrPage() {
    return (
        <div className="min-h-screen bg-white text-black">
            <div className="flex flex-col justify-center items-center gap-24 py-24">
                <h1 className="text-3xl font-bold">Ad Your Adress</h1>
                <div>
                    <form className="flex flex-col gap-10">
                        <div>
                            <label>Name-Surename:</label>
                            <input type="text" className="border-[1px] border-black rounded-md w-full" required/>
                        </div>
                        <div>
                            <label>Adress:</label>
                            <input type="text" className="border-[1px] border-black rounded-md w-full" required/>
                        </div>
                        <div>
                            <label>Phone Number:</label>
                            <input type="text" className="border-[1px] border-black rounded-md w-full" required/>
                        </div>
                        <div className="flex justify-between items-center mt-10">
                            <button><h1 className="bg-black text-white w-20 h-8 flex justify-center items-center rounded-md">Submit</h1></button>
                            <a href="/"><h1 className="bg-red-600 text-white w-20 h-8 flex justify-center items-center rounded-md">Cancel</h1></a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}