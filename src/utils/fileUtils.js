/**
 * Utility functions for file operations
 */

/**
 * Creates an object URL from a file
 * @param {File} file - The file to create an object URL for
 * @returns {string} Object URL
 */
export const createObjectURL = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revokes an object URL to free memory
 * @param {string} url - The object URL to revoke
 */
export const revokeObjectURL = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Loads an image from a URL and returns its dimensions
 * @param {string} url - The URL of the image
 * @returns {Promise<{width: number, height: number, image: HTMLImageElement}>} Image dimensions and element
 */
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        image: img
      });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

/**
 * Converts a data URL to a Blob
 * @param {string} dataUrl - The data URL to convert
 * @returns {Blob} The resulting Blob
 */
export const dataURLtoBlob = (dataUrl) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

/**
 * Converts a Blob to a data URL
 * @param {Blob} blob - The Blob to convert
 * @returns {Promise<string>} Promise that resolves with the data URL
 */
export const blobToDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(blob);
  });
};


