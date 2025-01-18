'use client';

import { ToggleSwitch } from '../ui/toggle-switch';

export function Header() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <ToggleSwitch
          options={[
            { label: 'Home', value: 'home' },
            { label: 'Data', value: 'data' },
            { label: 'Analysis', value: 'analysis' }
          ]}
          onChange={(value) => console.log(value)}
          defaultValue="home"
        />
      </div>
    </div>
  );
}