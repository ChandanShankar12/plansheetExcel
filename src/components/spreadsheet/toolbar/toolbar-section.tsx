'use client';

import { cn } from '@/lib/utils';

interface ToolbarSectionProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
}

export function ToolbarSection({ children, className, border = true }: ToolbarSectionProps) {
  return (
    <div className={cn(
      "flex items-center gap-1",
      border && "border rounded-md",
      className
    )}>
      {children}
    </div>
  );
}