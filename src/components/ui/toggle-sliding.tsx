'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function ToggleSliding() {
  const [isOn, setIsOn] = useState(false);

  return (
    <motion.div
      className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer ${
        isOn ? 'bg-green-500' : 'bg-gray-300'
      }`}
      onClick={() => setIsOn(!isOn)}
    >
      <motion.div
        className="w-4 h-4 bg-white rounded-full"
        animate={{ x: isOn ? '100%' : '0%' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.div>
  );
} 