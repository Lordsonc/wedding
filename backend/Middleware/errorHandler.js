import multer from 'multer';

export const errorHandler = (
  err,
  req,
  res,
  next
) => {
  console.error('Server Error:', err);

  // ==========================================
  // MULTER ERRORS
  // ==========================================

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(413).json({
          success: false,
          error:
            'File is too large. Maximum file size is 40 MB.',
        });

      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error:
            'Too many files. Please reduce the number of files uploaded.',
        });

      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error:
            `Unexpected upload field "${err.field}". Use "images" for photos and "videos" for videos.`,
        });

      default:
        return res.status(400).json({
          success: false,
          error:
            err.message ||
            'Invalid file upload.',
        });
    }
  }

  // ==========================================
  // INVALID FILE TYPE
  // ==========================================

  if (
    err.message?.startsWith(
      'Invalid file type.'
    )
  ) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // ==========================================
  // GENERAL ERROR
  // ==========================================

  return res.status(500).json({
    success: false,
    error:
      'An unexpected server error occurred.',
  });
};