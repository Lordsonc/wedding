import React, { memo } from 'react';

const CelebrationDetails = memo(({ coupleNames = '', dateText = '', hashtag = '' }) => {
  return (
    <div className="mt-8 sm:mt-12 md:mt-16 space-y-2 sm:space-y-3 md:space-y-4 pointer-events-none select-none drop-shadow-lg px-4 sm:px-6 w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto text-center">
      
      {/* Eyebrow Text */}
      <p className="text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg text-stone-200 font-light tracking-widest sm:tracking-[0.2em] uppercase">
        Celebrate
      </p>
      
      {/* Names Heading */}
      <h3 className="text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl italic text-white font-serif leading-tight sm:leading-snug break-words">
        ♥ {coupleNames} ♥
      </h3>
      
      {/* Subtitle */}
      <p className="text-xs xs:text-sm sm:text-lg md:text-xl lg:text-2xl text-stone-200 font-light">
        Wedding Day!!!
      </p>
      
      {/* Description Text */}
      <p className="text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg text-stone-200/90 font-light max-w-xs sm:max-w-lg md:max-w-xl mx-auto leading-normal sm:leading-relaxed">
        Share your favorite moments from {dateText || 'our special day'} by uploading photos and videos above.
      </p>

      {/* Hashtag */}
      <p className="text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl tracking-wider sm:tracking-widest font-bold text-white pt-2 sm:pt-3 break-all sm:break-normal">
        {hashtag}
      </p>
      
    </div>
  );
});

export default CelebrationDetails;