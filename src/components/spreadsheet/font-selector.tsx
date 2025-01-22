'use client';

import { Check, ChevronDown } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const FONT_FAMILIES = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Calibri', value: 'Calibri, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Tahoma', value: 'Tahoma, sans-serif' }
];

interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function FontSelector({ value, onChange }: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentFont = FONT_FAMILIES.find(font => font.value === value) || FONT_FAMILIES[0];

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-1 px-2 py-1 text-xs border rounded hover:bg-gray-50',
            'min-w-[120px] justify-between'
          )}
          style={{ fontFamily: currentFont.value }}
        >
          <span className="truncate">{currentFont.name}</span>
          <ChevronDown className="h-3 w-3 shrink-0" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-48 rounded-md border bg-white shadow-md"
          align="start"
        >
          <div className="max-h-60 overflow-auto">
            {FONT_FAMILIES.map((font) => (
              <button
                key={font.value}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-1.5 text-xs hover:bg-gray-100',
                  'transition-colors'
                )}
                onClick={() => {
                  onChange(font.value);
                  setIsOpen(false);
                }}
                style={{ fontFamily: font.value }}
              >
                <span>{font.name}</span>
                {font.value === value && <Check className="h-3 w-3" />}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
} 