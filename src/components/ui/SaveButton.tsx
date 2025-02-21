'use client';

import { useState } from 'react';
import { useSpreadsheet } from '@/context/spreadsheet-context';
import { Save } from 'lucide-react';
import { motion } from 'framer-motion';

export function SaveButton() {
  const { app } = useSpreadsheet();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const workbook = app.getWorkbook();
      
      const response = await fetch('/api/workbook/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workbook.toJSON())
      });

      if (!response.ok) {
        throw new Error('Failed to save workbook');
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleSave}
      disabled={isSaving}
      className={`
        flex items-center justify-center w-9 h-9
        hover:bg-[#f1f3f4] transition-colors
        ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {isSaving ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-[#3c4043] border-t-transparent rounded-full"
        />
      ) : (
        <Save className="w-5 h-5 text-[#3c4043]" />
      )}
    </motion.button>
  );
} 