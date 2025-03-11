import { detectWhitespace, cropImage } from '../utils/cropWhitespace';
import { detectBoxByEdges } from '../utils/edgeDetection';

import { createObjectURL, getImageDimensions, revokeObjectURL } from '../utils/fileUtils';


/**
 * Service for image processing operations
 */
export const imageService = {
  /**
   * Process multiple image files into image objects
   * @param {FileList} files - The files to process
   * @param {boolean} snapToEdges - Whether to snap to detected edges
   * @returns {Promise<Array>} Processed image objects
   */
// In src/services/imageService.js, improve the image processing flow:

/**
 * Process multiple image files into image objects
 * @param {FileList} files - The files to process
 * @param {boolean} snapToEdges - Whether to snap to detected edges
 * @returns {Promise<Array>} Processed image objects
 */
  async processImages(files, snapToEdges = true) {
    if (files.length === 0) return [];
    
    const newImages = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const imageId = `image_${Date.now()}_${i}`;
        const objectUrl = createObjectURL(file);
        
        // Load image and get dimensions
        const { width, height, image } = await getImageDimensions(objectUrl);
        
        // Create a canvas for image processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0);
        
        // Get image data for whitespace detection
        const imageData = ctx.getImageData(0, 0, width, height);
        
        // Detect and crop whitespace
        const whitespaceBbox = detectWhitespace(imageData) || {
          x: 0,
          y: 0,
          width,
          height
        };
        
        const croppedCanvas = cropImage(image, whitespaceBbox);
        if (!croppedCanvas) {
          console.error('Failed to crop image');
          continue;
        }
        
        // Get cropped image
        const croppedImage = new Image();
        croppedImage.src = croppedCanvas.toDataURL();
        await new Promise((resolve) => {
          croppedImage.onload = resolve;
        });
        
        // Create a new canvas with the cropped image for edge detection
        const edgeCanvas = document.createElement('canvas');
        const edgeCtx = edgeCanvas.getContext('2d');
        edgeCanvas.width = croppedCanvas.width;
        edgeCanvas.height = croppedCanvas.height;
        edgeCtx.drawImage(croppedImage, 0, 0);
        
        // Get image data for edge detection from the cropped image
        const croppedImageData = edgeCtx.getImageData(0, 0, croppedCanvas.width, croppedCanvas.height);
        
        // Detect bounding box on the cropped image
        let bbox;
        try {
          console.log("Bounding Box Detection Running On:", croppedImageData.width, croppedImageData.height);
          bbox = detectBoxByEdges(croppedImageData, snapToEdges);
          console.log("Detected bounding box:", bbox);
        } catch (error) {
          console.error('Error in edge detection:', error);
          // Fallback to default bounding box (10% inset from each edge)
          bbox = {
            x1: Math.round(croppedCanvas.width * 0.1),
            y1: Math.round(croppedCanvas.height * 0.1),
            x2: Math.round(croppedCanvas.width * 0.9),
            y2: Math.round(croppedCanvas.height * 0.9)
          };
        }
        
        // Store detected edges for later use
        const detectedEdges = {
          horizontal: [], // Store processed horizontal edges
          vertical: []    // Store processed vertical edges
        };
        
        // Create image object with correct coordinate handling
        const imageObject = {
          id: imageId,
          filename: file.name,
          width: croppedCanvas.width,
          height: croppedCanvas.height,
          image: croppedImage,
          src: croppedCanvas.toDataURL(),
          bbLeftOffset: bbox.x1,
          bbTopOffset: bbox.y1,
          bbWidth: bbox.x2 - bbox.x1,
          bbHeight: bbox.y2 - bbox.y1,
          detectedEdges,
          originalWidth: width,
          originalHeight: height,
          cropBbox: {
            x: whitespaceBbox.x,
            y: whitespaceBbox.y,
            width: whitespaceBbox.width,
            height: whitespaceBbox.height
          }
        };
        
        newImages.push(imageObject);
      } catch (error) {
        console.error(`Error processing image ${file.name}:`, error);
      }
    }
    
    return newImages;
  }
};

