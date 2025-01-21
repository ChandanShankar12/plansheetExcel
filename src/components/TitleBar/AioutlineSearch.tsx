import { Input } from '../ui/input';
import Image from 'next/image';
import { ToggleSliding } from '../ui/toggle-sliding';

export const AioutlineSearch = () => {
  return (
    <div className="relative">
      {/* Search Bar */}
      <div className="flex flex-row items-center gap-2">
        <div className="w-[20px] h-[20px]">
          <Image
            src="/images/Group 91.svg"
            alt="Search"
            width={20}
            height={20}
          />
        </div>
        <div className="w-[400px]">
          <Input 
            placeholder="Ask your assistant to search or answer anything from the Sheets"
            className="h-[25px] text-[10px] px-2 bg-white"
          />
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '48px' }}>
        <ToggleSliding />
      </div>
    </div>
  );
};
