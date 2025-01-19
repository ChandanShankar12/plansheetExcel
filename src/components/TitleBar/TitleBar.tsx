import Image from 'next/image';

import { Button } from '../ui/button';
import { AioutlineSearch } from './AioutlineSearch';
import { ToggleSwitch } from '../ui/toggle-switch';
import { Divider } from '../ui/divider';

export const TitleBar = () => {
  return (
    <div className="flex flex-row w-screen items-center bg-[#E3E3E3] h-[35px] px-2 py-4">
      {/* Left section */}
      <div className="flex flex-row items-center gap-1">
        <Image
          src="/Icons/fluent_save-16-regular.svg"
          alt="Logo"
          width={24}
          height={24}
        />
        <span className="text-[12px] flex flex-row items-center gap-2">
          <ToggleSwitch /> AutoSave
        </span>
        <Divider />
      </div>

      {/* Center section */}
      <div className="flex-1 flex justify-center">
        <AioutlineSearch />
      </div>

      {/* Right section */}
      <div className="flex flex-row items-center gap-1">
        {/* Language selector */}
        <div className="flex flex-row items-center gap-2">
          <span className="text-[10px]">English</span>
          <Image
            src="/Icons/icon_chevron.svg"
            alt="Search"
            width={20}
            height={20}
          />
        </div>

        <Divider />

        {/* Window controls */}
        <div className="flex">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Image
              src="/Icons/mingcute_minimize-fill.svg"
              alt="Minimize"
              width={14}
              height={14}
            />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Image
              src="/Icons/mingcute_restore-line.svg"
              alt="Restore"
              width={14}
              height={14}
            />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Image
              src="/Icons/radix-icons_cross-2.svg"
              alt="Close"
              width={14}
              height={14}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};
