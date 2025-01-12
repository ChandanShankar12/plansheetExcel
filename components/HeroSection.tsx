import Image from "next/image";
import { greetingAccordingToTime } from "@/utils/utils";

interface HeroSectionProps {
  height: number;
}

const HeroSection = ({height}: HeroSectionProps) => {
    return (
      <div 
        className="relative flex bg-[#166534] items-center justify-center w-full"
        style={{ height: `${height}px` }}
      >
        {/* Background wave and blur effect */}
        <div className="absolute inset-0 w-full h-full">
          <div className="flex items-end justify-center opacity-25">
            <svg className="w-full" viewBox="0 0 1437 132" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 105.674C0 105.674 175.434 40.0219 292 13.1736C419.287 -16.144 569.464 -20.632 718.5 -12.2393C867.068 -3.87294 1014.5 17.2932 1137 39.4224C1314.76 71.534 1440 105.674 1440 105.674V205.674H0V105.674Z" fill="url(#paint0_linear_1302_1255)"/>
              <defs>
                <linearGradient id="paint0_linear_1302_1255" x1="720" y1="205.674" x2="720" y2="105.674" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#16634"/>
                  <stop offset="1" stopColor="#8DFBB7"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[20px] shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/30"/>
        </div>

        {/* Content Container */}
        <div className="relative w-full max-w-7xl mx-auto p-32">
          <div className="flex flex-row justify-between items-center gap-8 md:gap-0">
            {/* Left content */}
            <div className="flex items-center gap-8">
              <div className="shrink-0">
                <Image 
                  src="/images/Group 91.svg" 
                  alt="logo" 
                  height={92}
                  width={92}
                  className="w-[72px] md:w-[92px]"
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

            {/* Right content */}
            <div className="flex flex-col items-center">
              <p className="text-[#F5F3F3] font-sans text-[8px] mb-1 font-medium italic leading-[150%] tracking-[0.32px] text-center">
                For real Time Collaboration
              </p>
              <div className="flex items-center border border-white/75 px-2.5 py-2.5 hover:bg-white/10 transition-colors">
                <span className="text-[#F5F3F3] text-xs font-semibold leading-[150%] tracking-[0.32px] mx-2.5">
                  Sign in 
                </span>
                <Image 
                  src="/Icons/icons_sign-in.svg" 
                  alt="sign in" 
                  height={20} 
                  width={20}
                  className="w-4 md:w-5" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default HeroSection;

  