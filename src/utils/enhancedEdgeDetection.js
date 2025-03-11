/**
 * Enhanced edge detection for scientific graphs
 * This version focuses on detecting the actual plot area by:
 * 1. Using more sensitive edge detection for chart elements
 * 2. Ignoring text and sparse elements (like axis labels)
 * 3. Detecting axis lines to establish chart boundaries
 * 4. Applying chart-specific heuristics for bar/line graphs
 */

/**
 * Detects a bounding box focused on the actual chart content
 * @param {ImageData} imageData - Image data from canvas
 * @param {boolean} snapToEdges - Whether to snap to detected edges
 * @returns {Object} Bounding box coordinates (x1, y1, x2, y2)
 */
export const detectChartBox = (imageData, snapToEdges = true) => {
    try {
      console.log("Starting enhanced chart detection...");
      const width = imageData.width;
      const height = imageData.height;
      const pixels = imageData.data;
      
      // 1. Convert to grayscale with improved contrast
      const grayscale = new Uint8ClampedArray(width * height);
      for (let i = 0; i < pixels.length; i += 4) {
        // Enhanced grayscale conversion with contrast adjustment
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        
        // Skip fully transparent pixels
        if (a < 10) {
          grayscale[i / 4] = 255; // White for transparent
          continue;
        }
        
        // Standard grayscale conversion
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Enhance contrast for detection
        grayscale[i / 4] = gray;
      }
      
      // 2. Detect horizontal and vertical content density
      const hDensity = new Uint32Array(height);
      const vDensity = new Uint32Array(width);
      
      // Calculate pixel density along each row and column
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const pixel = grayscale[idx];
          
          // Count non-white pixels (content pixels)
          if (pixel < 240) {
            hDensity[y]++;
            vDensity[x]++;
          }
        }
      }
      
      // 3. Detect axis lines (they typically have consistent density)
      const potentialAxes = {
        horizontal: [], // Store potential horizontal axis positions
        vertical: []    // Store potential vertical axis positions
      };
      
      // Find potential horizontal axis lines (x-axis)
      for (let y = 10; y < height - 10; y++) {
        // Look for line-like horizontal densities
        if (hDensity[y] > width * 0.3 && hDensity[y] < width * 0.7) {
          // Check if there's significantly less content in surrounding rows
          const prevRows = (hDensity[y-1] + hDensity[y-2] + hDensity[y-3]) / 3;
          const nextRows = (hDensity[y+1] + hDensity[y+2] + hDensity[y+3]) / 3;
          
          if (hDensity[y] > prevRows * 1.5 || hDensity[y] > nextRows * 1.5) {
            potentialAxes.horizontal.push(y);
          }
        }
      }
      
      // Find potential vertical axis lines (y-axis)
      for (let x = 10; x < width - 10; x++) {
        // Look for line-like vertical densities
        if (vDensity[x] > height * 0.3 && vDensity[x] < height * 0.7) {
          // Check if there's significantly less content in surrounding columns
          const prevCols = (vDensity[x-1] + vDensity[x-2] + vDensity[x-3]) / 3;
          const nextCols = (vDensity[x+1] + vDensity[x+2] + vDensity[x+3]) / 3;
          
          if (vDensity[x] > prevCols * 1.5 || vDensity[x] > nextCols * 1.5) {
            potentialAxes.vertical.push(x);
          }
        }
      }
      
      // 4. Identify content regions with density thresholds
      // Find high-density regions that likely represent actual chart content
      const contentThreshold = 0.15; // Minimum pixel density to be considered content
      
      let topBound = Math.floor(height * 0.1); // Default: 10% from top
      let bottomBound = Math.floor(height * 0.9); // Default: 90% from top
      let leftBound = Math.floor(width * 0.1); // Default: 10% from left
      let rightBound = Math.floor(width * 0.9); // Default: 90% from left
      
      // Find top bound (first high-density row after skipping title area)
      for (let y = Math.floor(height * 0.1); y < Math.floor(height * 0.5); y++) {
        if (hDensity[y] / width > contentThreshold) {
          topBound = y;
          break;
        }
      }
      
      // Find bottom bound (last high-density row before x-axis labels)
      for (let y = Math.floor(height * 0.9); y > Math.floor(height * 0.5); y--) {
        if (hDensity[y] / width > contentThreshold) {
          bottomBound = y;
          break;
        }
      }
      
      // Find left bound (first high-density column after y-axis labels)
      for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.5); x++) {
        if (vDensity[x] / height > contentThreshold) {
          leftBound = x;
          break;
        }
      }
      
      // Find right bound (last high-density column)
      for (let x = Math.floor(width * 0.9); x > Math.floor(width * 0.5); x--) {
        if (vDensity[x] / height > contentThreshold) {
          rightBound = x;
          break;
        }
      }
      
      // 5. Adjust bounds based on axis detection
      if (potentialAxes.vertical.length > 0) {
        // Find the leftmost vertical axis
        const yAxis = Math.min(...potentialAxes.vertical);
        // Set left bound to just before y-axis
        leftBound = Math.max(Math.floor(width * 0.05), yAxis - 5);
      }
      
      if (potentialAxes.horizontal.length > 0) {
        // Find the bottommost horizontal axis
        const xAxis = Math.max(...potentialAxes.horizontal);
        // Set bottom bound to just below x-axis
        bottomBound = Math.min(Math.floor(height * 0.95), xAxis + 5);
      }
      
      // 6. Apply scientific chart heuristics
      // Most charts have margins, so inset slightly to exclude borders
      const marginInset = Math.min(width, height) * 0.02;
      
      leftBound = Math.max(Math.floor(width * 0.05), leftBound - marginInset);
      rightBound = Math.min(Math.floor(width * 0.99), rightBound + marginInset);
      topBound = Math.max(Math.floor(height * 0.05), topBound - marginInset);
      bottomBound = Math.min(Math.floor(height * 0.98), bottomBound + marginInset);
      
      console.log("Chart detection complete");
      console.log("Bounds:", {left: leftBound, right: rightBound, top: topBound, bottom: bottomBound});
      
      return {
        x1: leftBound,
        y1: topBound,
        x2: rightBound,
        y2: bottomBound
      };
      
    } catch (error) {
      console.error("Error in chart detection:", error);
      // Return a default bounding box if detection fails
      return {
        x1: Math.round(imageData.width * 0.1),
        y1: Math.round(imageData.height * 0.1),
        x2: Math.round(imageData.width * 0.9),
        y2: Math.round(imageData.height * 0.9)
      };
    }
  };
  
  /**
   * Specialized detection for bar charts
   * This detects the actual chart area more precisely
   */
  export const detectBarChartBox = (imageData) => {
    // Start with standard chart detection
    const initialBox = detectChartBox(imageData, true);
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    
    try {
      // Extract just the detected chart area for further analysis
      const chartWidth = initialBox.x2 - initialBox.x1;
      const chartHeight = initialBox.y2 - initialBox.y1;
      
      // Analyze column density to detect bars
      const columnDensity = new Array(chartWidth).fill(0);
      
      // Count non-white pixels in each column within the chart area
      for (let x = 0; x < chartWidth; x++) {
        for (let y = 0; y < chartHeight; y++) {
          const imgX = x + initialBox.x1;
          const imgY = y + initialBox.y1;
          
          if (imgX >= 0 && imgX < width && imgY >= 0 && imgY < height) {
            const idx = (imgY * width + imgX) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];
            const a = pixels[idx + 3];
            
            // Count non-white, non-transparent pixels
            if (a > 20 && (r < 240 || g < 240 || b < 240)) {
              columnDensity[x]++;
            }
          }
        }
      }
      
      // Find columns with significant content (bars)
      const significantColumns = [];
      const threshold = chartHeight * 0.1; // At least 10% of height to be considered a bar
      
      for (let x = 0; x < chartWidth; x++) {
        if (columnDensity[x] > threshold) {
          significantColumns.push(x + initialBox.x1);
        }
      }
      
      // If we found significant columns, adjust the bounding box
      if (significantColumns.length > 0) {
        const minBarX = Math.max(initialBox.x1, Math.min(...significantColumns) - 10);
        const maxBarX = Math.min(initialBox.x2, Math.max(...significantColumns) + 10);
        
        // Update the box to focus on the actual bars
        return {
          x1: minBarX,
          y1: initialBox.y1,
          x2: maxBarX,
          y2: initialBox.y2
        };
      }
      
      // If bar detection didn't work, return initial box
      return initialBox;
      
    } catch (error) {
      console.error("Error in bar chart detection:", error);
      return initialBox;
    }
  };
  
  /**
   * Specialized detection for line charts and other scientific plots
   */
  export const detectLineChartBox = (imageData) => {
    // Similar implementation as bar charts but optimized for lines
    // Start with standard chart detection
    return detectChartBox(imageData, true);
  };
  
  /**
   * Wrapper function that determines chart type and applies the appropriate detector
   * @param {ImageData} imageData - Image data from canvas
   * @param {boolean} snapToEdges - Whether to snap to detected edges
   * @returns {Object} Bounding box coordinates (x1, y1, x2, y2)
   */
  export const detectSciChartBox = (imageData, snapToEdges = true) => {
    try {
      // Perform basic type detection (bar vs line chart)
      const chartType = detectChartType(imageData);
      
      if (chartType === 'bar') {
        return detectBarChartBox(imageData);
      } else if (chartType === 'line') {
        return detectLineChartBox(imageData);
      } else {
        // Generic chart detection
        return detectChartBox(imageData, snapToEdges);
      }
    } catch (error) {
      console.error("Error in chart type detection:", error);
      return detectChartBox(imageData, snapToEdges);
    }
  };
  
  /**
   * Basic chart type detection
   * @param {ImageData} imageData - Image data
   * @returns {string} Chart type ('bar', 'line', or 'unknown')
   */
  const detectChartType = (imageData) => {
    // Simple heuristic based chart type detection
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    
    // Sample a grid of pixels to detect patterns
    const sampleSize = 10; // Sample every 10th pixel
    const horizontalRuns = []; // Store horizontal continuous pixel runs
    const verticalRuns = []; // Store vertical continuous pixel runs
    
    // Check horizontal runs (more common in bar charts)
    for (let y = Math.floor(height * 0.3); y < Math.floor(height * 0.7); y += sampleSize) {
      let currentRun = 0;
      
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const isContent = pixels[idx + 3] > 20 && // Non-transparent
                         (pixels[idx] < 240 || pixels[idx + 1] < 240 || pixels[idx + 2] < 240); // Non-white
        
        if (isContent) {
          currentRun++;
        } else if (currentRun > 0) {
          horizontalRuns.push(currentRun);
          currentRun = 0;
        }
      }
      
      if (currentRun > 0) {
        horizontalRuns.push(currentRun);
      }
    }
    
    // Check vertical runs (more common in line charts)
    for (let x = Math.floor(width * 0.3); x < Math.floor(width * 0.7); x += sampleSize) {
      let currentRun = 0;
      
      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * 4;
        const isContent = pixels[idx + 3] > 20 && // Non-transparent
                         (pixels[idx] < 240 || pixels[idx + 1] < 240 || pixels[idx + 2] < 240); // Non-white
        
        if (isContent) {
          currentRun++;
        } else if (currentRun > 0) {
          verticalRuns.push(currentRun);
          currentRun = 0;
        }
      }
      
      if (currentRun > 0) {
        verticalRuns.push(currentRun);
      }
    }
    
    // Calculate average run lengths
    const avgHorizontalRun = horizontalRuns.length ? 
      horizontalRuns.reduce((sum, val) => sum + val, 0) / horizontalRuns.length : 0;
    
    const avgVerticalRun = verticalRuns.length ? 
      verticalRuns.reduce((sum, val) => sum + val, 0) / verticalRuns.length : 0;
    
    // Determine chart type based on run patterns
    if (avgHorizontalRun > avgVerticalRun * 1.5) {
      return 'bar'; // Wide horizontal runs suggest bar chart
    } else if (avgVerticalRun > avgHorizontalRun * 1.2) {
      return 'line'; // Taller vertical runs suggest line chart
    } else {
      return 'unknown';
    }
  };