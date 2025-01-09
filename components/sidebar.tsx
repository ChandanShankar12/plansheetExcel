import Link from 'next/link';
import Image from 'next/image';

const Sidebar = () => {
  return (
    <aside className="w-[343px] mx-[62px] bg-[#FFFFFF] text-black h-screen flex flex-col justify-between p-4">
      
      
      <div>

        <div className=" absolute top-0 left-0 flex flex-row items-center justify-center">
          <Image src="/images/Group 91.svg" alt="logo" height={92} width={92} />
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col items-left justify-start my-4">
            <span className="text-[#1A6844] border-[#1A6844] border-2 pl-2 font-inter text-[14px] font-semibold tracking-[0.42px]">New File </span>
            <div className="flex flex-row items-center justify-start">
              <Image src="/Icons/icon_new-file.svg" alt="logo" height={26} width={18}  />
              <span className="text-[#000000] font-inter text-[12px] font-semibold tracking-[0.36px]">Create Blank Document</span>
            </div>
            <div className="flex flex-row items-center justify-start">
              <Image src="/Icons/icon_new-file.svg" alt="logo" height={26} width={18} />
              <span className="text-[#000000] font-inter text-[12px] font-semibold tracking-[0.36px]">Create with Ai Support</span>
            </div>
          </div>

          <canvas className="w-full h-[2px] bg-gray-200">

          </canvas>

          <div>

          </div>  

        </div>

        <div className="border-t border-green-500">
          <Link href="/profile">Profile</Link>
          <Link href="/settings">Settings</Link>
        </div>

      </div>
    </aside >
  );
};

export default Sidebar;
