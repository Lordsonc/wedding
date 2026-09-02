import React, { memo } from 'react';

const HeroSection = memo(({ title = '', subtitle = '' }) => {
  return (
    <div className="text-center space-y-2 sm:space-y-3 md:space-y-4 px-4 sm:px-6 max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto drop-shadow-md">
      
      {/* Main Title */}
      <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight sm:leading-snug md:leading-none break-words transition-all duration-300">
        {title}
      </h1>
      
      {/* Subtitle */}
      <p className="text-xs xs:text-sm sm:text-lg md:text-xl lg:text-2xl font-light text-stone-200 tracking-wide max-w-xs xs:max-w-sm sm:max-w-xl md:max-w-2xl mx-auto leading-relaxed sm:leading-normal">
        {subtitle}
      </p>
      
    </div>
  );
});

export default HeroSection;