import React, { memo } from 'react';

const FrameCards = memo(({ groomImg, brideImg }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 my-10 w-full max-w-4xl">
      <div className="w-64 h-80 md:w-72 md:h-96 border-4 border-[#9E2A5D] rounded-[100px_30px_100px_30px] overflow-hidden shadow-2xl transform -rotate-2 hover:scale-105 transition duration-300">
        <img
          src={groomImg}
          alt="Groom"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="w-64 h-80 md:w-72 md:h-96 border-4 border-[#9E2A5D] rounded-[30px_100px_30px_100px] overflow-hidden shadow-2xl transform rotate-2 hover:scale-105 transition duration-300">
        <img
          src={brideImg}
          alt="Bride"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
});

export default FrameCards;