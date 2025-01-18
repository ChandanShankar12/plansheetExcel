'use client';

import Image from "next/image";
import { greetingAccordingToTime } from "../utils/utils";

interface SplashScreenProps {
  isOpen?: boolean;
  height?: number;
  width?: number;
}

export default function SplashScreen({ isOpen = true, height = 584, width = 624 }: SplashScreenProps) {
  return (
    <div className="relative flex flex-col bg-primaryColor">
      <div><span className="text-[10px] text-white font-semibold tracking-[0.72px] right-0">v.1.0.0</span></div>

      <div className="flex flex-col justify-between items-center p-16">
      <div className="flex flex-row justify-center"> 
        <div> <Image src="/images/Group 91.svg" alt="logo" width={100} height={100} /></div>
        <div className="flex flex-col">
          <span className="text-[24px] text-white font-semibold tracking-[0.72px]">Good Morning</span>
          <span className="text-[10px] text-white font-semibold tracking-[0.72px]">Personal Edition</span>
        </div>
      </div>
      <div> talk to your assistant </div>
      </div>


      <div className="flex flex-col justify-between items-center">
        <div className="flex flex-row justify-start h-full w-full">
          <div>sd </div>
          <div className="left-0">sd </div>
        </div>
        <div className="flex flex-row justify-between h-full w-full">
          <div>sd </div>
          <div>sd </div>
        </div>
      </div>
    </div>
      );
}
