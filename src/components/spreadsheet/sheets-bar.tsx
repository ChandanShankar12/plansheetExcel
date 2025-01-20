import { Span } from 'next/dist/trace/trace';
import { Button } from '../ui/button';
import Image from 'next/image';

import React from 'react';

export const SheetsBar = () => {
  return (
   
      <div className=" h-full w-full px-12 ">
        
          {' '}
          <div className="flex flex-col w-fit shrink-0">
            <div className="relative">
              <span className="text-[#11px] text-[#737375]">Sheet 1</span>
              <div className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-primaryColor"></div>
            </div>
          </div>

          <div><Image src="/Icons/teenyicons_spreadsheet-solid.png" alt="Excel Icon" width={16} height={16} /></div>
          
        
      </div>
    
  );
};
