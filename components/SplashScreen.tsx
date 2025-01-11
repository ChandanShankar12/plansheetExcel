import Image from 'next/image';
import { greetingAccordingToTime } from '../utils/utils';

const SplashScreen = () => {
  return (
    <div className=" relative flex w-[600px] h-screen bg-primaryColor">
      <div className=" absolute inset-0 w-full h-full">
        <div className=" flex flex-row justify-between">
          <div className="relative z-10 flex flex-col justify-space-between">
            <span className="text-[24px] text-white font-semibold tracking-[0.72px]">
              Xello
            </span>
            <span className="text-[10px] text-white font-semibold tracking-[0.72px]">
              Personal Edition
            </span>
          </div>
          <div className="relative z-10 bottom-0">
            <span className="text-[10px] text-white font-semibold tracking-[0.72px]">
              v.1.0.0
            </span>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center gap-8 md:gap-0">
          {/* Left content */}
          <div className="relative z-10 flex items-center gap-8">
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
        </div>

        {/* Background wave and blur effect */}
        <div className="absolute inset-0 w-full h-full">
          <div className="flex items-end justify-center opacity-25">
            <svg
              className="w-full"
              viewBox="0 0 1437 132"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 105.674C0 105.674 175.434 40.0219 292 13.1736C419.287 -16.144 569.464 -20.632 718.5 -12.2393C867.068 -3.87294 1014.5 17.2932 1137 39.4224C1314.76 71.534 1440 105.674 1440 105.674V205.674H0V105.674Z"
                fill="url(#paint0_linear_1302_1255)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_1302_1255"
                  x1="720"
                  y1="205.674"
                  x2="720"
                  y2="105.674"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#166534" />
                  <stop offset="1" stopColor="#8DFBB7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[20px] shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/30" />
        </div>

        <div className="relative z-10 flex flex-col">
          <span>For real Time Collaboration</span>
        </div>

        <div className="relative z-10 flex flex-col">
          
          <div className="flex flex-col border border-red-500">
            <div className=" space-y-10 flex flex-col border border-blue-500">
              <div className="flex flex-col border border-purple-500">
                <div className="text-white mx-10"> Hello World</div>
                <div> Hello World</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
