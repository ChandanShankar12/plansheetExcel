'use client';

import Image from "next/image";
import { greetingAccordingToTime } from "@/utils/utils";

interface SplashScreenProps {
  isOpen?: boolean;
  height?: number;
  width?: number;
}

export default function SplashScreen({ isOpen = true, height = 584, width = 624 }: SplashScreenProps) {
  return (
    <div 
      className="relative bg-primaryColor rounded-[15px] overflow-hidden"
      style={{ height: `${height}px`, width: `${width}px` }}
    >
      {/* Header */}
      <div className="absolute w-full h-full p-16 flex flex-col justify-between">
        <div className="flex flex-row justify-between gap-y-16">
          <div className="relative z-10 flex flex-col justify-between">
            <span className="text-[24px] text-white font-semibold tracking-[0.72px]">
              Xello
            </span>
            <span className="text-[10px] text-white font-semibold tracking-[0.72px]">
              Personal Edition
            </span>
          </div>
          <div className="relative z-10">
            <span className="text-[10px] text-white font-semibold tracking-[0.72px]">
              v.1.0.0
            </span>
          </div>
        </div>

        {/* Greeting */}
        <div className="flex flex-row items-center justify-center">
          <div className="relative z-10 flex items-center gap-8">
            <div className="shrink-0">
              <Image 
                src="/images/Group 91.svg" 
                alt="logo" 
                height={92}
                width={92}
              />
            </div>
            <div>
              <h1 className="text-[#F5F3F3] font-sans text-lg font-bold italic leading-[150%] tracking-[0.18px]">
                {greetingAccordingToTime()}
              </h1>
              <p className="text-[#F5F3F3] font-sans text-xs font-medium italic leading-[150%] tracking-[0.32px]">
                Hi, How can I help you today?
              </p>
            </div>
          </div>
        </div>

        {/* Wave Background */}
        <div className="absolute inset-0 w-full h-full">
          <div className="relative top-64 flex items-end justify-center opacity-25">
            <svg
              className="w-full h-full"
              viewBox="0 0 2874 264"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 211.348C0 211.348 350.868 80.0438 584 26.3472C838.574 -32.288 1138.928 -41.264 1437 -24.4786C1734.136 -7.74588 2029 34.5864 2274 78.8448C2629.52 143.068 2880 211.348 2880 211.348V411.348H0V211.348Z"
                fill="url(#paint0_linear_1302_1255)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_1302_1255"
                  x1="1440"
                  y1="411.348"
                  x2="1440"
                  y2="211.348"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#166534" />
                  <stop offset="1" stopColor="#8DFBB7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {/* Glassmorphism effect */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[20px] shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/30" />
        </div>

        {/* Footer */}
        <div className="relative flex flex-col text-left">
          <span className="text-white text-[10px] font-normal tracking-[0.3px]">
            Copyright © 2024 juni - All Rights Reserved.
          </span>
        </div>
      </div>
    </div>
  );
}
