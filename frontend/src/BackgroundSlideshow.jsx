import React, { memo } from 'react';

const BackgroundSlideshow = memo(({ images = [], current = 0 }) => {
  if (!images.length) return null;

  return (
    <div className="absolute inset-0 -z-10 bg-black">
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
          }`}
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(71,18,46,0.85)), url(${img})`,
            transitionProperty: 'opacity, transform',
            transitionDuration: '1000ms',
            willChange: 'opacity, transform',
          }}
        />
      ))}
    </div>
  );
});

export default BackgroundSlideshow;