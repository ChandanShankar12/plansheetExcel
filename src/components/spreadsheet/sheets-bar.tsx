'use client';

import { useSpreadsheet } from '@/context/spreadsheet-context';
import { Sheet } from '@/server/models/sheet';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SheetsBar() {
  const { 
    sheets, 
    activeSheet,
    isTransitioning,
    addSheet,
    switchSheet
  } = useSpreadsheet();

  const [isAdding, setIsAdding] = useState(false);

  const handleAddSheet = async () => {
    if (isTransitioning || isAdding) return;
    
    try {
      setIsAdding(true);
      const newSheet = await addSheet();
      if (!newSheet) {
        throw new Error('Failed to create sheet');
      }
    } catch (error) {
      console.error('Error adding sheet:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSheetClick = async (sheet: Sheet) => {
    if (isTransitioning || sheet.getId() === activeSheet?.getId()) return;
    await switchSheet(sheet);
  };

  return (
    <div className="flex items-center h-[32px] border-t border-[#e1e3e6] bg-[#f8f9fa]">
      <div className="flex items-center space-x-1 px-2">
        <AnimatePresence mode="popLayout">
          {sheets.map((sheet) => (
            <motion.div
              key={sheet.getId()}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className={`
                relative px-3 py-1 cursor-pointer rounded-t-md
                ${sheet.getId() === activeSheet?.getId() ? 'bg-white' : 'hover:bg-gray-100'}
                ${isTransitioning && sheet.getId() === activeSheet?.getId() ? 'opacity-50' : ''}
              `}
              onClick={() => handleSheetClick(sheet)}
            >
              <span className="text-[13px] text-[#333]">{sheet.getName()}</span>
              {sheet.getId() === activeSheet?.getId() && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1a73e8]"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAddSheet}
        disabled={isTransitioning || isAdding}
        className={`
          flex items-center justify-center w-8 h-8
          hover:bg-[#e8f0fe] transition-colors rounded-full
          ${(isTransitioning || isAdding) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isAdding ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-[#1a73e8] border-t-transparent rounded-full"
          />
        ) : (
          <Plus className="w-4 h-4 text-[#1a73e8]" />
        )}
      </motion.button>
    </div>
  );
}
