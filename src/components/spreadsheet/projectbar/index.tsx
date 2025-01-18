import Image from 'next/image';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { Button } from '@/components/ui/button';
import { PlusIcon, TrashIcon } from 'lucide-react';

export function ProjectBar() {
  return (
    <div className="flex flex-row justify-between items-center">
      <div className="flex flex-row gap-2">
        <div className="w-10 h-10 bg-gray-200 rounded-full">
          <Image src="/images/blanksheet.jpg" alt="Logo" width={40} height={40} />
        </div>
        <div className="flex flex-row"> 
          <p className="text-sm font-medium">Blank Sheet</p>
          <p className="text-xs text-gray-500">(Unsaved)</p>
        </div>
      </div>
      <ToggleSwitch options={[{ label: 'Feminino', value: 'f' }, { label: 'Masculino', value: 'm' }]} />
      <div className="flex flex-row gap-2">
        <Button>
          <PlusIcon className="w-4 h-4" />
        </Button>
      <Button>
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

