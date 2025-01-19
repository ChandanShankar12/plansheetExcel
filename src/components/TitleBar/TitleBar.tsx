import Image from 'next/image';
import { Toggle } from '../ui/toggle';
import { ToggleSwitch } from '../ui/toggle-switch';
import { Button } from '../ui/button';
import { AioutlineSearch } from './AioutlineSearch';
import { Divider } from '../ui/divider';

export const TitleBar = () => {
  return (
    <div className="flex flex-row justify-between items-center">
      <div className="flex flex-row items-center gap-2 ">
        <Image src="/images/blanksheet.jpg" alt="Logo" width={40} height={40} />
        <Divider />
        <Toggle>
          <ToggleSwitch options={[{ label: 'Feminino', value: 'f' }, { label: 'Masculino', value: 'm' }]} />
        </Toggle>
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
