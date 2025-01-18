import {Input} from  '../ui/input'
import Image from 'next/image'

export const AioutlineSearch = () => {
  return (
    <div className="flex flex-row items-center gap-2">
        <Image src="/images/blanksheet.jpg" alt="Search" width={20} height={20} />
      <div><Input placeholder="Search" /></div>
    </div>
  )
}

