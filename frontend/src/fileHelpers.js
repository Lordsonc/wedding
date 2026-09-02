// Creates blob previews asynchronously without blocking UI rendering
export const generatePreviews = (files) => {
  return files.map((file) => ({
    file,
    id: `${file.name}-${file.lastModified}-${Math.random()}`,
    url: URL.createObjectURL(file),
  }));
};

// Revokes object URLs from browser memory to prevent memory leaks during heavy usage
export const revokePreviews = (previewObjects) => {
  previewObjects.forEach((item) => URL.revokeObjectURL(item.url));
};