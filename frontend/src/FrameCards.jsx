import React, { memo } from 'react';

const FrameCards = memo(({ groomImg, brideImg }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12 my-6 sm:my-8 md:my-10 w-full max-w-4xl px-4">
      
      {/* Groom Card - Base: -rotate-2 -> Hover/Touch: tilt left (-rotate-6) */}
      <div className="w-48 h-64 xs:w-56 xs:h-72 sm:w-60 sm:h-80 md:w-72 md:h-96 border-4 border-[#9E2A5D] rounded-[100px_30px_100px_30px] overflow-hidden shadow-2xl transform -rotate-2 hover:-rotate-6 hover:scale-105 active:-rotate-6 active:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
        <img
          src={groomImg}
          alt="Groom"
          className="w-full h-full object-cover pointer-events-none"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Bride Card - Base: rotate-2 -> Hover/Touch: tilt right (rotate-6) */}
      <div className="w-48 h-64 xs:w-56 xs:h-72 sm:w-60 sm:h-80 md:w-72 md:h-96 border-4 border-[#9E2A5D] rounded-[30px_100px_30px_100px] overflow-hidden shadow-2xl transform rotate-2 hover:rotate-6 hover:scale-105 active:rotate-6 active:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
        <img
          src={brideImg}
          alt="Bride"
          className="w-full h-full object-cover pointer-events-none"
          loading="lazy"
          decoding="async"
        />
      </div>
      
    </div>
  );
});

export default FrameCards;