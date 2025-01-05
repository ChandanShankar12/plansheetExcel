'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';

export function FileMenu() {
  const handleNew = () => {
    // Implement new spreadsheet functionality
  };

  const handleSave = () => {
    // Implement save functionality
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <FileSpreadsheet className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleNew}>New</DropdownMenuItem>
        <DropdownMenuItem onClick={handleSave}>Save</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}