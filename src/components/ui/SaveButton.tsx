'use client';

import { useState } from 'react';
import { useSpreadsheet } from '@/context/spreadsheet-context';
import { Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';

export const SaveButton = () => {
  const { sheets, activeSheet } = useSpreadsheet();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (isSaving || !activeSheet) return;

    try {
      setIsSaving(true);
      
      const response = await fetch('/api/workbook/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheets: sheets.map(s => s.toJSON())
        })
      });

      if (!response.ok) throw new Error('Failed to save workbook');

      toast({
        title: 'Success',
        description: 'Workbook saved successfully',
      });
    } catch (error) {
      console.error('Failed to save:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workbook',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-7 w-7" 
      onClick={handleSave} 
      disabled={isSaving || !activeSheet}
    >
      {isSaving ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-[#3c4043] border-t-transparent rounded-full"
        />
      ) : (
        <Save className="h-4 w-4" />
      )}
    </Button>
  );
}; 