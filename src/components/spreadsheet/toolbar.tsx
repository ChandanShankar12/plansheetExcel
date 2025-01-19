'use client';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { 
  Undo2, 
  Redo2, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Table2 
} from 'lucide-react';

export function Toolbar() {
  return (
    <div className="flex items-center gap-2 p-1 border-b border-gray-200 bg-white">
      {/* Undo/Redo */}
      <div className="flex items-center gap-1 border-r pr-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Font Controls */}
      <div className="flex items-center gap-1">
        <select defaultValue="Arial" className="h-8 px-2 border rounded">
          <option>Arial</option>
        </select>
        <select defaultValue="12" className="h-8 w-16 px-2 border rounded">
          <option>12</option>
        </select>
      </div>

      {/* Text Formatting */}
      <div className="flex items-center gap-1 border-l border-r px-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Table Tools */}
      <div className="flex items-center gap-1 border-l pl-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Table2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
