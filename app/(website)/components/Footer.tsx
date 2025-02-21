export default function ComponentsFooter() {
    return (
        <div className='flex justify-between'>
        <div className='bg-white w-[648px] h-[200px] border-black border-[1px] pl-[20px] pt-[20px]'>
          <a href="/"><h1 className='text-black text-xl font-bold'>VIN_SHOP</h1></a>
        </div>
        <div className='bg-white w-[632px] h-[200px] border-black border-[1px] pl-[20px] py-5 flex flex-col'>
          <h1 className='text-black text-xl font-bold'>ABOUT US</h1>
          <h1 className='text-black text-xl font-bold'>GARMENT SIZING</h1>
          <h1 className='text-black text-xl font-bold'>SHIPING & RETURN</h1>
          <h1 className='text-black text-xl font-bold'>PRIVACY POLICY</h1>
          <h1 className='text-black text-xl font-bold'>TERMS OF SERVICE</h1>
        </div>
        <div className='bg-white w-[632px] h-[200px] border-black border-[1px] pl-[20px] pt-[20px]'>
          <h1 className='text-black text-xl font-bold'>INSTARGRAM</h1>
          <h1 className='text-black text-xl font-bold'>TIKTOK</h1>
        </div>
      </div>
    )
}