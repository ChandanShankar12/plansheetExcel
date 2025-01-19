import {Input} from  '../ui/input'
import Image from 'next/image'

export const AioutlineSearch = () => {
  return (
    <div className="flex flex-row items-center justify-center gap-2 h-[25px]">
      <div className='w-[20px] h-[20px]'><Image src="/images/Group 91.svg" alt="Search" width={20} height={20} /></div>
      <div className='w-[300px]'><Input placeholder="Search" className='h-[25px]' /></div>
    </div>
  )
}
