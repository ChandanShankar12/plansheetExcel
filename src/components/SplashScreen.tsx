'use client';

import Image from 'next/image';
import { greetingAccordingToTime } from '../utils/utils';
import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { FileHandler } from '@/server/services/file/file-handler';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface RecentFile {
  name: string;
  lastModified: string;
}

export default function SplashScreen({ isOpen = true, onClose }: SplashScreenProps) {
  const { application } = useSpreadsheetContext();
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  // Load recent files on component mount
  useEffect(() => {
    const loadRecentFiles = async () => {
      const files = await FileHandler.loadFromLocalStorage('recentFiles') || [];
      setRecentFiles(files);
    };
    loadRecentFiles();
  }, []);

  const handleNewFile = () => {
    const workbook = application.createWorkbook();
    FileHandler.updateRecentFiles('Untitled Workbook');
    onClose?.();
  };

  const handleOpenFile = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.coho';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const content = await file.text();
          const workbook = await FileHandler.loadWorkbook(content);
          application.setActiveWorkbook(workbook.id);
          FileHandler.updateRecentFiles(file.name);
          onClose?.();
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const handleOpenRecentFile = async (fileName: string) => {
    try {
      // Load the file from localStorage or your backend
      const workbookData = await FileHandler.loadFromLocalStorage(fileName);
      if (workbookData) {
        const workbook = await FileHandler.loadWorkbook(JSON.stringify(workbookData));
        application.setActiveWorkbook(workbook.id);
        FileHandler.updateRecentFiles(fileName);
        onClose?.();
      }
    } catch (error) {
      console.error('Error opening recent file:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: "32" }}
          animate={{ height: "32%" }}
          exit={{ height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative flex flex-row bg-primaryColor overflow-hidden"
        >
          <div className="flex flex-row justify-between items-start p-16 w-full">
            {/* Left Section - Logo and Title */}
            <div className="flex flex-col justify-center">
              <div>
                <Image
                  src="/images/Group 91.svg"
                  alt="logo"
                  width={100}
                  height={100}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[24px] text-white font-semibold tracking-[0.72px]">
                  {greetingAccordingToTime()}
                </span>
                <span className="text-[10px] text-white font-semibold tracking-[0.72px]">
                  Personal Edition
                </span>
              </div>
            </div>

            {/* Center Section - Actions */}
            <div className="flex flex-col gap-4">
              <button
                onClick={handleNewFile}
                className="flex items-center gap-2 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Image
                  src="/images/new-file.svg"
                  alt="new file"
                  width={24}
                  height={24}
                />
                <span className="text-white">New File</span>
              </button>

              <button
                onClick={handleOpenFile}
                className="flex items-center gap-2 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Image
                  src="/images/open-file.svg"
                  alt="open file"
                  width={24}
                  height={24}
                />
                <span className="text-white">Open file</span>
              </button>
            </div>

            {/* Right Section - Recent Files */}
            <div className="flex flex-col gap-4">
              <span className="text-white font-medium text-xl">Recent Files</span>
              <div className="flex flex-col gap-2">
                {recentFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => handleOpenRecentFile(file.name)}
                    className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors w-[300px]"
                  >
                    <div className="flex items-center gap-2">
                      <Image src="/images/file.svg" alt="file" width={20} height={20} />
                      <span className="text-white text-sm truncate">
                        {file.name}
                      </span>
                    </div>
                    <span className="text-white/60 text-xs">
                      {new Date(file.lastModified).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
