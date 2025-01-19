'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number[];
  value?: number[];
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  onValueChange?: (value: number[]) => void;
}


const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      leftIcon = <Image
      src="/Icons/icomoon-free_zoom-out.svg"
      alt="zoom out"
      width={16}
      height={16}
    />,
      rightIcon = <Image
      src="/Icons/icomoon-free_zoom-in.svg"
      alt="zoom in"
      width={16}
      height={16}
    />,
      min = 0,
      max = 100,
      step = 1,
      defaultValue,
      value,
      orientation = 'horizontal',
      disabled = false,
      onValueChange,
      ...props
    },
    ref
  ) => (
    <div className="flex items-center gap-2">
      {leftIcon && <div className="flex-shrink-0">{leftIcon}</div>}
      <SliderPrimitive.Root
        ref={ref}
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        value={value}
        orientation={orientation}
        disabled={disabled}
        onValueChange={onValueChange}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          orientation === 'vertical' && 'flex-col',
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            'relative h-0.5 w-full grow overflow-hidden rounded-full bg-white',
            orientation === 'vertical' && 'h-full w-0.5'
          )}
        >
          <SliderPrimitive.Range className="absolute h-full bg-white" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-1 border-2 border-primary bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      {rightIcon && <div className="flex-shrink-0">{rightIcon}</div>}
    </div>
  )
);

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
export type { SliderProps };
