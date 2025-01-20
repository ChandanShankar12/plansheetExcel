'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ToggleSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function ToggleSwitch({ className, ...props }: ToggleSwitchProps) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        {...props}
      />
      <div className={cn(
        "w-[24px] h-[16px] bg-gray-00 rounded-full peer",
        "peer-checked:after:translate-x-full peer-checked:after:border-white", 
        "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
        "after:bg-white after:border-gray-300 after:border after:rounded-full",
        "after:h-[14px] after:w-[14px] after:transition-all",
        "peer-checked:bg-green-500",
        className
      )}></div>
    </label>
  );
}
