'use client';

import { useSpreadsheetContext } from '@/hooks/spreadsheet-context';
import axios from 'axios';
import { useState } from 'react';

export function SaveButton() {
  const { application } = useSpreadsheetContext();
  const [isSaving, setIsSaving] = useState(false);

  console.log(application);
  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // First attempt to save to database and get file data
      const response = await axios.post('/api/save', { application }, { 
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Check if response is valid
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Create file name with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `workbook-${timestamp}.dtst`;

      try {
        // Try modern File System Access API first
        if ('showSaveFilePicker' in window) {
          const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [{
              description: 'DTST Spreadsheet',
              accept: {
                'application/json': ['.dtst']
              }
            }],
            excludeAcceptAllOption: false
          });
          
          const writable = await handle.createWritable();
          await writable.write(response.data);
          await writable.close();
          
          console.log('File saved successfully using File System Access API');
        } else {
          // Fallback for browsers that don't support File System Access API
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          
          // Create a dialog to inform user about fallback behavior
          const userChoice = window.confirm(
            'Your browser does not support choosing save location. ' +
            'The file will be saved to your default downloads folder. Continue?'
          );
          
          if (userChoice) {
            document.body.appendChild(link);
            link.click();
            link.remove();
          }
          
          window.URL.revokeObjectURL(url);
        }
      } catch (fsError) {
        if (fsError instanceof Error && fsError.name === 'AbortError') {
          // User cancelled the save operation
          console.log('Save operation cancelled by user');
          return;
        }
        
        // Handle other errors with fallback download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error saving file:', error);
      let errorMessage = 'Failed to save file. Please try again.';
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || errorMessage;
      }
      
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isSaving}
      className={`flex items-center gap-2 px-3 py-1 text-sm rounded
        ${isSaving 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'hover:bg-gray-100'
        }`}
    >
      {isSaving ? 'Saving...' : 'Save'}
    </button>
  );
} 