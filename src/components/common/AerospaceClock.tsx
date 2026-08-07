import React, { useState, useEffect } from 'react';

export const AerospaceClock: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const utcHours = String(time.getUTCHours()).padStart(2, '0');
  const utcMinutes = String(time.getUTCMinutes()).padStart(2, '0');
  const utcSeconds = String(time.getUTCSeconds()).padStart(2, '0');

  return (
    <div className="flex items-center space-x-2 font-mono-data text-[10px] text-[#00A8FF]">
      <span className="bg-[#172236] px-2 py-0.5 rounded border border-[#1A2740] font-bold">
        {utcHours}:{utcMinutes}:{utcSeconds} UTC
      </span>
    </div>
  );
};
