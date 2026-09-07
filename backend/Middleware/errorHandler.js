import multer from 'multer';

export const errorHandler = (err, req, res, next) => {
  console.error('Server Error:', err);

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'One or more files exceed the 40MB limit.',
        });

      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Maximum 10 files allowed per upload.',
        });

      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Unexpected file field. Use "files" as the form-data field name.',
        });

      default:
        return res.status(400).json({
          success: false,
          error: err.message,
        });
    }
  }

  if (
    err.message ===
    'Only supported image and video files are allowed.'
  ) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    error: 'An unexpected server error occurred.',
  });
};