'use client';

import { Button } from '@/components/ui/button';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';

export function FormattingTools() {
  return (
    <>
      <div className="flex items-center gap-1">
        <Type className="h-4 w-4" />
        <select className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm">
          <option>12</option>
          <option>14</option>
          <option>16</option>
        </select>
      </div>
      <div className="flex items-center border rounded-md">
        <Button variant="ghost" size="icon" className="rounded-none">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-none">
          <Italic className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center border rounded-md">
        <Button variant="ghost" size="icon" className="rounded-none">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-none">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-none">
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}