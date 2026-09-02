import React, { memo } from 'react';

const HeroSection = memo(({ title, subtitle }) => {
  return (
    <div className="text-center mt-4 pointer-events-none select-none">
      <h1 className="text-5xl md:text-7xl tracking-wider text-[#9E2A5D] font-bold drop-shadow-md uppercase">
        {title}
      </h1>
      <p className="text-lg md:text-2xl text-stone-200 mt-2 font-light italic">
        {subtitle}
      </p>
    </div>
  );
});

export default HeroSection;