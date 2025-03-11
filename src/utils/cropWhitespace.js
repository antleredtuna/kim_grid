/**
 * Detects and crops whitespace from an image
 * @param {ImageData} imageData - The image data to process
 * @param {number} [threshold=250] - The brightness threshold to consider as whitespace
 * @returns {Object|null} - The bounding box of the non-whitespace content, or null if the image is empty
 */
export const detectWhitespace = (imageData, threshold = 250) => {
  const { width, height, data } = imageData;
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let foundContent = false;

  for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          // Check if the pixel is not considered "white" or "transparent"
          if ((r < threshold || g < threshold || b < threshold) && a > 10) {
              foundContent = true;
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
          }
      }
  }

  // If no non-whitespace pixels found, return null
  if (!foundContent) return null;

  return {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1
  };
};

/**
* Crops an image based on the detected whitespace
* @param {HTMLImageElement} image - The image to crop
* @param {Object|null} bbox - The bounding box of the non-whitespace content
* @returns {HTMLCanvasElement|null} - The cropped image as a canvas element, or null if no content
*/
export const cropImage = (image, bbox) => {
  if (!bbox) return null; // No valid bounding box, return null

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = bbox.width;
  canvas.height = bbox.height;
  ctx.drawImage(image, bbox.x, bbox.y, bbox.width, bbox.height, 0, 0, bbox.width, bbox.height);
  return canvas;
};
