'use client';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CellStyle } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSpreadsheet } from '@/context/spreadsheet-context';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Link, Image as ImageIcon, Table, Undo, Redo, Type
} from 'lucide-react';

export const Divider = memo(() => (
  <div className="h-6 w-[1px] bg-gray-300" />
));

interface ToolbarContentProps {
  inDropdown?: boolean;
  contentRef: React.RefObject<HTMLDivElement>;
  formulaValue: string;
  onFormulaChange: (value: string) => void;
  onStyleChange: (style: Partial<CellStyle>) => void;
  isDisabled: boolean;
}

const ToolbarContent = memo(function ToolbarContent({ 
  inDropdown = false,
  contentRef,
  formulaValue,
  onFormulaChange,
  onStyleChange,
  isDisabled
}: ToolbarContentProps) {
  return (
    <div 
      ref={!inDropdown ? contentRef : undefined} 
      className="flex h-[48px] flex-row justify-between items-center rounded-l-[6px] border-gray-300 border w-full px-2 gap-4"
    >
      {/* Style buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onStyleChange({ bold: true })}
          disabled={isDisabled}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onStyleChange({ italic: true })}
          disabled={isDisabled}
        >
          <Italic className="h-4 w-4" />
        </Button>
        {/* Add more style buttons */}
      </div>

      {/* Formula input */}
      <div className="flex-1">
        <Input 
          className="h-8" 
          placeholder="Formula" 
          value={formulaValue}
          onChange={(e) => onFormulaChange(e.target.value)}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
});

export const Toolbar = memo(function Toolbar() {
  const { activeSheet, activeCell, updateCell } = useSpreadsheet();
  const [formulaValue, setFormulaValue] = useState('');
  const [isOverflowing, setIsOverflowing] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFormulaChange = useCallback((value: string) => {
    setFormulaValue(value);
  }, []);

  const handleStyleChange = useCallback(async (style: Partial<CellStyle>) => {
    if (!activeSheet || !activeCell) return;

    try {
      const currentCell = activeSheet.getCell(activeCell);
      await updateCell(activeCell, {
        style: { ...currentCell.style, ...style }
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update cell style',
        variant: 'destructive',
      });
    }
  }, [activeSheet, activeCell, updateCell, toast]);

  useEffect(() => {
    const checkOverflow = () => {
      if (toolbarRef.current && contentRef.current) {
        setIsOverflowing(contentRef.current.scrollWidth > toolbarRef.current.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  return (
    <div 
      ref={toolbarRef}
      className="flex flex-row h-full w-full justify-center items-center bg-white"
    >
      <ToolbarContent
        contentRef={contentRef}
        formulaValue={formulaValue}
        onFormulaChange={handleFormulaChange}
        onStyleChange={handleStyleChange}
        isDisabled={!activeCell}
      />

      {isOverflowing && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-full w-[14px] bg-[#B3B3B3] rounded-r-[6px] hover:bg-[#A0A0A0] transition-colors"
            >
              <ChevronDown className="h-4 w-4 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[400px] p-2">
            <ToolbarContent
              inDropdown={true}
              contentRef={contentRef}
              formulaValue={formulaValue}
              onFormulaChange={handleFormulaChange}
              onStyleChange={handleStyleChange}
              isDisabled={!activeCell}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {!isOverflowing && (
        <div className="w-[14px] h-full bg-[#B3B3B3] rounded-r-[6px]" />
      )}
    </div>
  );
});
