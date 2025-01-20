

import { Slider } from "../ui/slider";



import React from 'react'

export const AppStatusBar = () => {
  return (
    
<div className="relative flex flex-row justify-between bg-primaryColor h-[22px] items-center w-screen">
        <div className="flex flex-row gap-4 px-4">
          <span className="text-white text-[10px]">Rows: {`Rows here`}</span>
          <span className="text-white text-[10px]">
            Columns: {`Columns here`}
          </span>
        </div>
        <div className="w-[200px] px-4">
          <Slider
            defaultValue={[50, 50]}
            orientation="horizontal"
            min={1}
            max={100}
            step={1}
          />
        </div>
      </div>
  )
}

export default AppStatusBar
