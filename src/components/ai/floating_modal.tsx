'use client';

import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import Image from 'next/image';
import { Button } from '../ui/button';

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
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isFloating) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const modalStyles = isFloating ? {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 50,
    cursor: isDragging ? 'grabbing' : 'grab'
  } as const : {};

  return (
    <div
      style={modalStyles}
      className={`
        flex flex-row items-center justify-between gap-2 
        bg-white rounded-lg p-2 shadow-lg
        ${isFloating ? 'w-[400px]' : 'w-full'}
      `}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex items-center gap-2 flex-1">
        <Image
          src="/Icons/teenyicons_spreadsheet-solid.png"
          alt="AI Assistant"
          width={24}
          height={24}
        />
        <Input
          placeholder="Ask your assistant..."
          className="flex-1"
        />
      </div>
      <Button variant="ghost" size="icon">
        <Image
          src="/Icons/teenyicons_spreadsheet-solid.png"
          alt="Send"
          width={20}
          height={20}
        />
      </Button>
    </div>
  );
}
