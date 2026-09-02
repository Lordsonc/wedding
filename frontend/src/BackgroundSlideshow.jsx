import React, { memo } from 'react';

const BackgroundSlideshow = memo(({ images = [], current = 0 }) => {
  if (!images.length) return null;

  return (
    <div className="fixed inset-0 z-0 bg-black overflow-hidden pointer-events-none">
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform ${
            index === current 
              ? 'opacity-100 scale-105 z-10' 
              : 'opacity-0 scale-100 z-0'
          }`}
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(71,18,46,0.85)), url("${img}")`,
            willChange: 'opacity, transform',
          }}
        />
      ))}
    </div>
  );
});

export default BackgroundSlideshow;