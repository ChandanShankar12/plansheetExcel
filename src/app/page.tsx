'use client';

import { Spreadsheet } from '@/components/spreadsheet';
import { Aside, AsideWrapper } from '@/components/Aside';
import { FloatingModal } from '@/components/ai/floating_modal';
import { useState } from 'react';

export default function Home() {
  const [isFloatingModalVisible, setIsFloatingModalVisible] = useState(true);

  return (
    <div className="flex h-full min-h-0">
      <div className="flex-1 min-w-0 relative">
        <Spreadsheet />
        {isFloatingModalVisible && (
          <div className="absolute bottom-12 left-4 z-50">
            {/* <FloatingModal isFloating={true} /> */}
          </div>
        )}
      </div>
      <Aside />
    </div>
  );
}
