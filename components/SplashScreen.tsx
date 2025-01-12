import Image from 'next/image';
import { greetingAccordingToTime } from '../utils/utils';

/**
 * SplashScreen Component
 * Displays the initial screen of the application with various sections including:
 * - Header with app name and version
 * - Greeting message
 * - Background wave effect with blur
 * - Action buttons for new file creation and file operations
 * - Recent files list
 */
const SplashScreen = () => {
  return (
    <div className="relative flex w-[600px] items-center justify-center h-screen bg-primaryColor">
      <div className="absolute w-full h-full p-16 flex flex-col justify-between">
        {/* Header Section - App Title and Version */}
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

        {/* Greeting Section */}
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
              <h1 className="text-[#F5F3F3] font-sans text-base md:text-lg font-bold italic leading-[150%] tracking-[0.18px]">
                {greetingAccordingToTime()}
              </h1>
              <p className="text-[#F5F3F3] font-sans text-xs font-medium italic leading-[150%] tracking-[0.32px]">
                Hi, How can I help you today?
              </p>
            </div>
          </div>
        </div>

        {/* Background Wave and Blur Effect */}
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
          {/* Glassmorphism effect overlay */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[20px] shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/30" />
        </div>

        {/* Main Content Section */}
        <div className="relative w-[486px] h-[294px] flex flex-row items-center justify-start gap-8">
          <div className="absolute w-full h-full rounded-lg bg-white/5 backdrop-blur-[20px]" />

          {/* Left Column - File Operations */}
          <div className="relative flex flex-col gap-6 justify-start h-full">
            {/* New File Section */}
            <div className="relative flex flex-col gap-2 items-left justify-between">
              <span className="text-white text-[14px] font-semibold tracking-[0.42px]">
                New File
              </span>
              {/* Create Blank Sheet Option */}
              <div className="flex flex-row gap-2 items-center">
                <Image
                  src="/Icons/icon_new-file.svg"
                  alt="New file icon"
                  height={18}
                  width={26}
                  className="invert brightness-0"
                />
                <span className="text-white text-[12px] font-normal tracking-[0.42px]">
                  Create a Blank Sheet
                </span>
              </div>
              {/* Create with AI Support Option */}
              <div className="flex items-center flex-row gap-2">
                <Image
                  src="/Icons/icon_new-file.svg"
                  alt="New file with AI icon"
                  height={18}
                  width={26}
                  className="invert brightness-0"
                />
                <span className="text-white text-[12px] font-normal tracking-[0.42px]">
                  Create with AI support
                </span>
              </div>
            </div>

            {/* File Operations Section */}
            <div className="flex flex-col gap-2">
              {/* Open File Option */}
              <div className="flex flex-row gap-2 items-center">
                <Image
                  src="/Icons/icon_open_file.svg"
                  alt="Open file icon"
                  height={18}
                  width={26}
                  className="invert brightness-0"
                />
                <span className="text-white text-[12px] font-normal tracking-[0.42px]">
                  Open File
                </span>
              </div>

              {/* Learn More Option */}
              <div className="flex flex-row gap-2 items-center">
                <Image
                  src="/Icons/icon_learn_ai.svg"
                  alt="Learn AI icon"
                  height={18}
                  width={26}
                />
                <span className="text-white text-[12px] font-normal tracking-[0.42px]">
                  Learn More About AI Features
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Files */}
          <div className="relative flex flex-col gap-4">
            <span className="text-white text-[12px] font-normal tracking-[0.42px]">
              Recent Files
            </span>
            {/* Recent Files List - Dynamically Generated */}
            {(() => {
              const recentFiles = [
                {
                  title: '303_MDA 2024 Boothplan',
                  icon: '/Icons/icon_spreadsheet-solid.svg',
                },
                {
                  title: '303_MDA 2024 Boothplan',
                  icon: '/Icons/icon_spreadsheet-solid.svg',
                },
                {
                  title: '303_MDA 2024 Boothplan',
                  icon: '/Icons/icon_spreadsheet-solid.svg',
                },
                {
                  title: '303_MDA 2024 Boothplan',
                  icon: '/Icons/icon_spreadsheet-solid.svg',
                },
                {
                  title: '303_MDA 2024 Boothplan',
                  icon: '/Icons/icon_spreadsheet-solid.svg',
                },
              ];
              return recentFiles.map((file, index) => (
                <div key={index} className="flex flex-row gap-2">
                  <Image
                    src={file.icon}
                    alt="file icon"
                    height={16}
                    width={16}
                  />
                  <span className="text-white text-[12px] font-normal tracking-[0.42px]">
                    {file.title}
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="relative flex flex-col text-left">
          <span className="text-white text-[10px] font-normal tracking-[0.3px]">
            Copyright © 2024 juni - All Rights Reserved.
          </span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
