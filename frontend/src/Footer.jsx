import React, { memo } from 'react';

const Footer = memo(({ developerTag }) => {
  return (
    <footer className="w-full bg-[#B01762] py-3 sm:py-4 md:py-5 px-4 text-center text-[10px] xs:text-xs sm:text-sm md:text-base text-stone-200 font-sans tracking-wide sm:tracking-widest uppercase transition-all duration-300">
      DEVELOPED WITH <span className="text-red-400 inline-block transition-transform hover:scale-125">♥</span> BY {developerTag}
    </footer>
  );
});

export default Footer;