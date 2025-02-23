'use client';

import { Spreadsheet } from '@/components/spreadsheet';
import { Aside } from '@/components/Aside';
import { memo } from 'react';


// Root page component with integrated provider
const HomePage = memo(function HomePage() {
  return (
    <div className="flex h-full min-h-0">
      <div className="flex-1 min-w-0 relative">
        <Spreadsheet />
      </div>
      <Aside />
    </div>
  );
});

export default HomePage;
