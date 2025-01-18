'use client';

import { useState } from 'react';

interface ToggleSwitchProps {
  options: Array<{
    label: string;
    value: string;
  }>;
  onChange?: (value: string) => void;
  defaultValue?: string;
}

export function ToggleSwitch({ options, onChange, defaultValue }: ToggleSwitchProps) {
  const [selected, setSelected] = useState(defaultValue || options[0].value);

  const handleToggle = (value: string) => {
    setSelected(value);
    onChange?.(value);
  };

  return (
    <div className="flex h-8 bg-white rounded-md border border-gray-200 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleToggle(option.value)}
          className={`
            px-4 py-1 text-sm font-medium rounded transition-colors
            ${selected === option.value 
              ? 'bg-primaryColor text-white' 
              : 'text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
} 