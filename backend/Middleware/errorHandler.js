import multer from 'multer';

export const errorHandler = (
  err,
  req,
  res,
  next
) => {
  console.error('Server Error:', err);

  // ====================================================
  // MULTER ERRORS
  // ====================================================

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
            'Maximum 5 files are allowed per upload.',
        });

      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error:
            `Unexpected upload field "${err.field}". Use "images" for images or "videos" for videos.`,
        });

      default:
        return res.status(400).json({
          success: false,
          error: err.message,
        });
    }
  }

  // ====================================================
  // INVALID FILE TYPE
  // ====================================================

  if (
    err.message?.startsWith(
      'Only JPG'
    )
  ) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // ====================================================
  // GENERAL ERROR
  // ====================================================

  return res.status(500).json({
    success: false,
    error:
      'An unexpected server error occurred.',
  });
};