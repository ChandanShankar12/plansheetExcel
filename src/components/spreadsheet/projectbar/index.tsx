import { TabSwitch } from '@/components/ui/tab-switch';

export function ProjectBar() {
  return (
    <div className="flex flex-row justify-between items-center h-14 px-4 border-b border-gray-200">
      {/* Left Section - Logo and Title */}
      <div className="flex items-center gap-4">
        {/* ... other elements */}
      </div>

      {/* Center Section - Tab Switch */}
      <TabSwitch 
        options={[
          { label: 'Home', value: 'home' },
          { label: 'Data', value: 'data' },
          { label: 'Analysis', value: 'analysis' }
        ]}
        defaultValue="home"
      />

      {/* Right Section - Actions */}
      <div className="flex items-center gap-1">
        {/* ... other elements */}
      </div>
    </div>
  );
} 