import { ToggleSliding } from '@/components/ui/toggle-sliding';
import { ToggleSwitch } from '@/components/ui/toggle-switch';

export function ProjectBar() {
  return (
    <div className="flex flex-row justify-between items-center h-12 px-4 bg-white">
      {/* Left Section - Logo and Title */}
      <div className="flex items-center gap-4">
        {/* ... other elements */}
        <ToggleSwitch 
          onChange={(e) => console.log(e.target.checked)}
          defaultChecked={false}
        />
      </div>

      {/* Center Section - Tab Switch */}
     <ToggleSliding/>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-1">
        {/* ... other elements */}
      </div>
    </div>
  );
} 