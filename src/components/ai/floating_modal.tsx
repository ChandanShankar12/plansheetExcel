'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface FloatingModalProps {
  isFloating?: boolean;
}

export function FloatingModal({ isFloating = false }: FloatingModalProps) {
  const [position, setPosition] = useState({ x: 20, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Set initial position after component mounts
    setPosition({ x: 20, y: window.innerHeight - 100 });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFloating) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isFloating) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const modalStyles = isFloating
    ? ({
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50,
        cursor: isDragging ? 'grabbing' : 'grab',
      } as const)
    : {};

  return (
    <div
      style={modalStyles}
      className={`
        flex flex-col items-center justify-between
         backdrop-blur-ls rounded-lg bg-[#F5F5F5] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border-[1px] border-[#000000] border-opacity-10
        ${isFloating ? 'w-[524px] h-[130px]' : 'w-full'}
      `}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex flex-col w-full h-full"> {/* Div 1 */}
        <div className="flex flex-col justify-center mx-6 py-4 gap-3 "> {/* Div 3 */}
          <div className="flex flex-row justify-start items-center ">
            <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-[12px] overflow-hidden">
              <Image
                src="/Icons/icon_add_files.svg"
                alt="Excel Icon"
                width={16}
                height={16}
              />
              <span className="text-sm text-gray-700">All Sheets</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-row justify-start">
            <Input placeholder="Progress" />
            <p className="text-sm text-gray-700 ml-2"><Button>Progress</Button></p>
          </div>
        
        </div>
      </div>

      <div className="flex flex-row h-[36px] w-full bg-[#D9D9D9] rounded-b-[12px]"> {/* Div 2 */}
        <div className="flex flex-1 h-[36px]"> {/* Div 5 */}
          <div className="flex flex-row items-center"> {/* Div 7 */}
            <ChevronRight className="w-4 h-4" />
            <span className="text-sm ml-1">Processing Data</span>
          </div>
        </div>
        <div className="flex flex-1 h-[36px]"> {/* Div 6 */}
          <div className="text-xs text-gray-600">Last updated: 2 mins ago</div>
          <div className="text-xs text-gray-600 ml-2">Next update: 1 min</div>
        </div>
      </div>
    </div>
  );
}
