'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabOption {
  label: string;
  value: string;
}

interface TabSwitchProps {
  options: TabOption[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function TabSwitch({ 
  options, 
  defaultValue = options[0]?.value, 
  onChange,
  className 
}: TabSwitchProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  const handleTabClick = (value: string) => {
    setActiveTab(value);
    onChange?.(value);
  };

  return (
    <div className={cn("flex items-center bg-gray-100/50 rounded-sm", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleTabClick(option.value)}
          className={cn(
            "px-4 py-1 text-xs transition-colors",
            "hover:bg-gray-100",
            activeTab === option.value && "bg-primaryColor text-white hover:bg-primaryColor/90"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
} 