import { Divider } from '../spreadsheet/toolbar';
import Image from 'next/image';
import { ToggleSwitch } from '../ui/toggle-switch';
import { AioutlineSearch } from './AioutlineSearch';
import { Button } from '../ui/button';


export const AppBar = () => {
  return (
    <div className="flex flex-row justify-between items-center">
      <div className="flex flex-row items-center gap-2 ">
        <Image src="/images/blanksheet.jpg" alt="Logo" width={40} height={40} />
        <Divider />
        <ToggleSwitch
          options={[
            { label: 'Feminino', value: 'f' },
            { label: 'Masculino', value: 'm' },
          ]}
        />
      </div>
      <AioutlineSearch />
      <div className='flex flex-row items-center gap-2'>
        <Button><Image src="/images/blanksheet.jpg" alt="Search" width={20} height={20} /></Button>
        <Button><Image src="/images/blanksheet.jpg" alt="Search" width={20} height={20} /></Button>
        <Button><Image src="/images/blanksheet.jpg" alt="Search" width={20} height={20} /></Button>
      </div>
    </div>
  );
};
