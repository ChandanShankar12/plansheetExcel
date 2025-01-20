'use client';

interface DividerProps {
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export function Divider({ orientation = 'vertical', className = '' }: DividerProps) {
  return (
    <div
      className={`
        ${orientation === 'vertical' 
          ? 'h-4 w-[1px] mx-2' 
          : 'w-full h-[1px] my-2'
        }
        bg-gray-300
        ${className}
      `}
    />
  );
}