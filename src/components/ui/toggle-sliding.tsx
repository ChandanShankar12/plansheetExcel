'use client';

import React from 'react';

interface ToggleSlidingProps {
  options?: string[];
}

export function ToggleSliding({ options = ['Home', 'Sheets', 'Analysis'] }: ToggleSlidingProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const optionWidth = 100 / options.length;
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (windowWidth < 768) { // Hide on mobile screens
    return null;
  }

  const toggleWidth = Math.min(502, Math.max(300, windowWidth * 0.3)); // Responsive width between 300px and 502px

  return (
    <div
      style={{
        display: "flex",
        borderRadius: "100px",
        backgroundColor: "#EFEFEF", 
        position: "relative",
        width: `${toggleWidth}px`,
        height: "26px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${optionWidth}%`,
          height: "100%",
          backgroundColor: "#166534",
          borderRadius: "40px",
          transition: "transform 0.3s ease",
          transform: `translateX(${selectedIndex * 100}%)`,
        }}
      />

      {options.map((option, index) => (
        <div
          key={option}
          style={{
            fontSize: "12px",
            fontWeight: "400",
            lineHeight: "18px",
            letterSpacing: "3%",
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
            cursor: "pointer",
            color: selectedIndex === index ? "white" : "inherit"
          }}
          onClick={() => setSelectedIndex(index)}
        >
          {option}
        </div>
      ))}
    </div>
  );
}