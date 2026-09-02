import React, { useRef, memo } from 'react';

const UploadZone = memo(({ previews, onFilesSelected, uploading, onUpload, message }) => {
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="w-full max-w-4xl border-2 border-dashed border-pink-300/60 rounded-3xl p-8 md:p-12 bg-stone-200/10 backdrop-blur-md cursor-pointer hover:bg-stone-200/20 transition"
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.length && onFilesSelected(e.target.files)}
        />

        <h2 className="text-xl md:text-3xl text-stone-100 uppercase tracking-widest font-normal mb-2">
          Share Your Favorite Moment From Our Day With Us
        </h2>
        <p className="text-sm md:text-base text-stone-300 font-light">
          Drag & drop or click to upload photos and videos (JPG, PNG, MP4, etc.) up to 5 files at once
        </p>

        {/* Previews Grid */}
        {previews.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {previews.map((item) => (
              <img
                key={item.id}
                src={item.url}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border-2 border-pink-400 shadow-md"
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={onUpload}
        disabled={uploading || previews.length === 0}
        className="mt-8 px-8 py-3 bg-[#8B2152]/80 hover:bg-[#8B2152] text-stone-200 rounded-2xl border border-pink-400/40 text-lg tracking-wider flex items-center gap-2 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>✦</span> {uploading ? 'UPLOADING TO DRIVE...' : 'SHARE MEMORIES'}
      </button>

      {/* Dynamic Feedback Message */}
      {message.text && (
        <p className={`mt-4 text-lg font-medium ${message.isError ? 'text-red-300' : 'text-green-300'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
});

export default UploadZone;