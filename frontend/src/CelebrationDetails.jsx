import React, { memo } from 'react';

const CelebrationDetails = memo(({ coupleNames = '', dateText = '', hashtag = '' }) => {
  return (
    <div className="mt-12 space-y-2 pointer-events-none select-none">
      <p className="text-lg text-stone-300 font-light">Celebrate</p>
      
      <h3 className="text-2xl md:text-4xl italic text-stone-100 font-serif">
        ♥ {coupleNames} ♥
      </h3>
      
      <p className="text-lg text-stone-300 font-light">Wedding Day!!!</p>
      
      {/* Safe evaluation for dateText */}
      <p className="text-sm md:text-base text-stone-300/80 font-light max-w-xl mx-auto">
        Share your favorite moments from {dateText || 'our special day'} by uploading photos and videos above.
      </p>

      {/* Safe evaluation for hashtag */}
      <p className="text-xl md:text-2xl tracking-widest font-bold text-stone-100 pt-2">
        {hashtag}
      </p>
    </div>
  );
});

export default CelebrationDetails;