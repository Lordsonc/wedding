import React, { useRef, memo } from 'react';

const UploadZone = memo(
  ({
    previews,
    onFilesSelected,
    onRemoveFile,
    uploading,
    onUpload,
    message,
  }) => {
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files?.length > 0) {
        onFilesSelected(e.dataTransfer.files);
      }
    };

    const handleFileChange = (e) => {
      if (e.target.files?.length > 0) {
        onFilesSelected(e.target.files);

        // Allows the same file to be selected again
        e.target.value = '';
      }
    };

    const handleRemove = (e, id) => {
      e.stopPropagation();
      onRemoveFile(id);
    };

    return (
      <div className="w-full flex flex-col items-center px-4 sm:px-6">
        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="w-full max-w-4xl border-2 border-dashed border-pink-300/60 rounded-2xl sm:rounded-3xl p-5 xs:p-6 sm:p-8 md:p-12 bg-stone-200/10 backdrop-blur-md cursor-pointer hover:bg-stone-200/20 transition-colors duration-300"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/mpeg"
            className="hidden"
            onChange={handleFileChange}
          />

          <h2 className="text-base xs:text-lg sm:text-2xl md:text-3xl text-stone-100 uppercase tracking-wide sm:tracking-widest font-normal mb-2 leading-snug sm:leading-normal">
            Share Your Favorite Moment From Our Day With Us
          </h2>

          <p className="text-xs xs:text-sm md:text-base text-stone-300 font-light leading-relaxed max-w-2xl mx-auto">
            Drag & drop or click to upload photos and videos. You can upload
            multiple files, with each file up to 40MB.
          </p>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
              {previews.map((item) => (
                <div key={item.id} className="relative group">
                  {/* Video Preview */}
                  {item.type?.startsWith('video/') ? (
                    <video
                      src={item.url}
                      controls
                      muted
                      playsInline
                      className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-pink-400 shadow-md"
                    />
                  ) : (
                    /* Image Preview */
                    <img
                      src={item.url}
                      alt="Selected memory"
                      className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-pink-400 shadow-md"
                    />
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, item.id)}
                    title="Remove file"
                    aria-label="Remove file"
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full w-5 h-5 xs:w-6 xs:h-6 flex items-center justify-center text-xs shadow-md border border-white transition-transform transform hover:scale-110"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          type="button"
          onClick={onUpload}
          disabled={uploading || previews.length === 0}
          className="mt-6 sm:mt-8 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#8B2152]/80 hover:bg-[#8B2152] active:scale-[0.98] text-stone-200 rounded-xl sm:rounded-2xl border border-pink-400/40 text-sm sm:text-lg tracking-wide sm:tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed max-w-full"
        >
          <span>✦</span>

          {uploading
            ? 'UPLOADING TO DRIVE...'
            : 'SHARE MEMORIES'}
        </button>

        {/* Feedback Message */}
        {message?.text && (
          <p
            className={`mt-3 sm:mt-4 text-xs xs:text-sm sm:text-base md:text-lg font-medium text-center px-2 ${
              message.isError
                ? 'text-red-300'
                : 'text-green-300'
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    );
  }
);

export default UploadZone;