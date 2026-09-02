import React, { memo } from 'react';

const Footer = memo(({ developerTag }) => {
  return (
    <footer className="bg-[#B01762] py-4 text-center text-xs md:text-sm text-stone-200 font-sans tracking-widest uppercase">
      DEVELOPED WITH <span className="text-red-400">♥</span> BY {developerTag}
    </footer>
  );
});

export default Footer;