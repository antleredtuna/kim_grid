/**
 * Detect bounding box from image using edge detection
 * @param {ImageData} imageData - Image data from canvas
 * @param {boolean} snapToEdges - Whether to snap to detected edges
 * @returns {Object} Bounding box coordinates (x1, y1, x2, y2)
 */
export const detectBoxByEdges = (imageData, snapToEdges = true) => {
  try {
    console.log("Starting edge detection...");
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    
    console.log(`Image dimensions: ${width}x${height}`);
    
    // Convert to grayscale
    const grayscale = new Uint8ClampedArray(width * height);
    for (let i = 0; i < pixels.length; i += 4) {
      grayscale[i / 4] = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    }
    
    console.log("Grayscale conversion complete");
    
    // Apply edge detection
    console.log("Applying Sobel edge detection...");
    const edges = applyEdgeDetection(grayscale, width, height, 30);
    
    // Find lines
    console.log("Finding lines...");
    const lines = findLines(edges, width, height, 0.2);
    console.log(`Found ${lines.horizontal.length} horizontal lines and ${lines.vertical.length} vertical lines`);
    
    // Find and refine the bounding box
    console.log("Finding bounding box from lines...");
    const bbox = findBoxFromLines(lines, width, height, snapToEdges);
    console.log("Edge detection complete", bbox);
    
    return bbox;
  } catch (error) {
    console.error("Error in detectBoxByEdges:", error);
    // Return a default bounding box
    return {
      x1: Math.round(imageData.width * 0.1),
      y1: Math.round(imageData.height * 0.1),
      x2: Math.round(imageData.width * 0.9),
      y2: Math.round(imageData.height * 0.9)
    };
  }
};

/**
 * Apply Sobel edge detection to grayscale image
 * @param {Uint8ClampedArray} grayscale - Grayscale image data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} threshold - Edge detection threshold
 * @returns {Uint8ClampedArray} Edge detected image
 */
const applyEdgeDetection = (grayscale, width, height, threshold) => {
  const edges = new Uint8ClampedArray(width * height);
  
  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;
      
      // Apply kernels
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * width + (x + kx);
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          
          gx += grayscale[idx] * sobelX[kernelIdx];
          gy += grayscale[idx] * sobelY[kernelIdx];
        }
      }
      
      // Gradient magnitude
      const mag = Math.sqrt(gx * gx + gy * gy);
      
      // Threshold
      edges[y * width + x] = mag > threshold ? 255 : 0;
    }
  }
  
  return edges;
};

/**
 * Find horizontal and vertical lines in edge-detected image
 * @param {Uint8ClampedArray} edges - Edge detected image
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} lineMinLengthFactor - Minimum line length as a factor of image size
 * @returns {Object} Horizontal and vertical lines
 */
const findLines = (edges, width, height, lineMinLengthFactor) => {
  const minLineLength = Math.min(width, height) * lineMinLengthFactor;
  
  const lines = {
    horizontal: [],
    vertical: []
  };
  
  // Detect horizontal lines
  for (let y = 0; y < height; y++) {
    let lineStart = -1;
    let lineLen = 0;
    
    for (let x = 0; x < width; x++) {
      if (edges[y * width + x] > 0) {
        if (lineStart === -1) lineStart = x;
        lineLen++;
      } else if (lineStart !== -1) {
        if (lineLen >= minLineLength) {
          lines.horizontal.push({
            y: y,
            x1: lineStart,
            x2: lineStart + lineLen - 1
          });
        }
        lineStart = -1;
        lineLen = 0;
      }
    }
    
    // Check line at edge of image
    if (lineStart !== -1 && lineLen >= minLineLength) {
      lines.horizontal.push({
        y: y,
        x1: lineStart,
        x2: lineStart + lineLen - 1
      });
    }
  }
  
  // Detect vertical lines
  for (let x = 0; x < width; x++) {
    let lineStart = -1;
    let lineLen = 0;
    
    for (let y = 0; y < height; y++) {
      if (edges[y * width + x] > 0) {
        if (lineStart === -1) lineStart = y;
        lineLen++;
      } else if (lineStart !== -1) {
        if (lineLen >= minLineLength) {
          lines.vertical.push({
            x: x,
            y1: lineStart,
            y2: lineStart + lineLen - 1
          });
        }
        lineStart = -1;
        lineLen = 0;
      }
    }
    
    // Check line at edge of image
    if (lineStart !== -1 && lineLen >= minLineLength) {
      lines.vertical.push({
        x: x,
        y1: lineStart,
        y2: lineStart + lineLen - 1
      });
    }
  }
  
  return lines;
};

/**
 * Group similar lines to handle noise
 * @param {Array} lines - Array of line objects
 * @param {string} positionKey - Key for position value
 * @param {number} threshold - Threshold for grouping
 * @returns {Array} Groups of similar lines
 */
const groupSimilarLines = (lines, positionKey, threshold) => {
  if (!lines || lines.length === 0) return [];
  
  // Sort lines by position
  lines.sort((a, b) => a[positionKey] - b[positionKey]);
  
  const groups = [];
  let currentGroup = {
    position: lines[0][positionKey],
    count: 1,
    lines: [lines[0]]
  };
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line belongs to the current group
    if (Math.abs(line[positionKey] - currentGroup.position) <= threshold) {
      // Add to current group
      currentGroup.lines.push(line);
      currentGroup.count++;
      
      // Recalculate average position
      const sum = currentGroup.lines.reduce((sum, l) => sum + l[positionKey], 0);
      currentGroup.position = Math.round(sum / currentGroup.count);
    } else {
      // Create a new group
      groups.push(currentGroup);
      currentGroup = {
        position: line[positionKey],
        count: 1,
        lines: [line]
      };
    }
  }
  
  // Add the last group
  groups.push(currentGroup);
  
  return groups;
};

/**
 * Find bounding box from detected lines
 * @param {Object} lines - Horizontal and vertical lines
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {boolean} snapToEdges - Whether to snap to detected edges
 * @returns {Object} Bounding box coordinates (x1, y1, x2, y2)
 */
const findBoxFromLines = (lines, width, height, snapToEdges = true) => {
 // If not snapping to edges, use default bounding box
 if (!snapToEdges || !lines) {
   return {
     x1: Math.round(width * 0.1),
     y1: Math.round(height * 0.1),
     x2: Math.round(width * 0.9),
     y2: Math.round(height * 0.9)
   };
 }
 
 // Group similar lines to handle noise and find the most significant ones
 const groupedHorizontal = groupSimilarLines(lines.horizontal, 'y', 5);
 const groupedVertical = groupSimilarLines(lines.vertical, 'x', 5);
 
 // Find significant lines (top, bottom, left, right)
 let top = null, bottom = null, left = null, right = null;
 
 // Sort by position
 groupedHorizontal.sort((a, b) => a.position - b.position);
 groupedVertical.sort((a, b) => a.position - b.position);
 
 // Get top and bottom lines
 if (groupedHorizontal.length >= 2) {
   top = groupedHorizontal[0];
   bottom = groupedHorizontal[groupedHorizontal.length - 1];
 } else if (groupedHorizontal.length === 1) {
   // Only one horizontal line found - assume it's top and estimate bottom
   top = groupedHorizontal[0];
   bottom = { position: Math.min(height - 1, top.position + Math.round(height * 0.8)) };
 } else {
   // No horizontal lines found - use default values
   top = { position: Math.round(height * 0.1) };
   bottom = { position: Math.round(height * 0.9) };
 }
 
 // Get left and right lines
 if (groupedVertical.length >= 2) {
   left = groupedVertical[0];
   right = groupedVertical[groupedVertical.length - 1];
 } else if (groupedVertical.length === 1) {
   // Only one vertical line found - assume it's left and estimate right
   left = groupedVertical[0];
   right = { position: Math.min(width - 1, left.position + Math.round(width * 0.8)) };
 } else {
   // No vertical lines found - use default values
   left = { position: Math.round(width * 0.1) };
   right = { position: Math.round(width * 0.9) };
 }
 
 return {
   x1: left.position,
   y1: top.position,
   x2: right.position,
   y2: bottom.position
 };
};

/**
* Snap a point to the nearest detected edge
* @param {number} position - Current position
* @param {Array} lineGroups - Grouped lines
* @param {number} threshold - Distance threshold for snapping
* @returns {number} Snapped position
*/
export const snapToNearestEdge = (position, lineGroups, threshold = 20) => {
 if (!lineGroups || lineGroups.length === 0) {
   return position;
 }
 
 let closestLine = null;
 let minDistance = Infinity;
 
 // Find the line closest to the position
 for (const group of lineGroups) {
   const distance = Math.abs(group.position - position);
   if (distance < minDistance && distance <= threshold) {
     minDistance = distance;
     closestLine = group;
   }
 }
 
 // If we found a line within threshold, snap to it
 if (closestLine) {
   return closestLine.position;
 }
 
 // Otherwise, return the original position
 return position;
};


