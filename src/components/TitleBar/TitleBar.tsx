import Image from 'next/image';

import { Button } from '../ui/button';
import { AioutlineSearch } from './AioutlineSearch';
import { ToggleSwitch } from '../ui/toggle-switch';
import { SaveButton } from '../ui/SaveButton';

import { Divider } from '../ui/divider';

export const TitleBar = () => {
  return (
    <div className="flex flex-row w-full items-center bg-[#E3E3E3] h-[35px] px-2">
      {/* Left section */}
      <div className="flex flex-row items-center gap-1">
        <SaveButton />
        <Divider />
        <span className="text-[12px]  flex flex-row items-center gap-2">
          <ToggleSwitch /> AutoSave
        </span>
      </div>

      {/* Center section */}
      <div className="flex-1 flex justify-center items-center">
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
        <div className="flex flex-row items-center gap-2">
          <Button variant="ghost" size="icon" className="h-3.5 w-3.5">
            <Image
              src="/Icons/mingcute_minimize-fill.svg"
              alt="Minimize"
              width={12}
              height={12}
            />
          </Button>
          <Button variant="ghost" size="icon" className="h-3.5 w-3.5">
            <Image
              src="/Icons/mingcute_restore-line.svg"
              alt="Restore"
              width={12}
              height={12}
            />
          </Button>
          <Button variant="ghost" size="icon" className="h-3.5 w-3.5">
            <Image
              src="/Icons/radix-icons_cross-2.svg"
              alt="Close"
              width={12}
              height={12}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};
