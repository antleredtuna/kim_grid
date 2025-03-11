/**
 * Service for grid-related operations
 */
export const gridService = {
  /**
   * Initialize grid cells based on dimensions
   * @param {Object} dimensions - Grid dimensions {rows, cols}
   * @returns {Array} Array of grid cells
   */
  initializeGrid(dimensions) {
    const { rows, cols } = dimensions;
    const newGridCells = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newGridCells.push({
          id: `cell-${row}-${col}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          row,
          col,
          imageId: null,
          scaleX: 1,
          scaleY: 1,
          horizontalOffset: 0,
          verticalOffset: 0
        });
      }
    }
    
    return newGridCells;
  },
  
  /**
   * Creates a timestamp for logging
   * @returns {string} Formatted timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  },
  
  /**
   * Align images in the grid
   * @param {Array} gridCells - The grid cells
   * @param {Array} images - The images
   * @param {Object} gridDimensions - Grid dimensions {rows, cols}
   * @param {Object} spacing - Spacing {horizontal, vertical}
   * @returns {Object} Updated grid cells and alignment log
   */
  alignImages(gridCells, images, gridDimensions, spacing) {
    const alignmentLog = [];
    const timestamp = this.getTimestamp();
    
    // Create a deep copy of grid cells to avoid mutation
    const updatedGridCells = JSON.parse(JSON.stringify(gridCells));
    
    // Log start of alignment
    alignmentLog.push({
      timestamp,
      message: 'Starting image alignment process',
      data: JSON.stringify({
        gridDimensions,
        spacing,
        cellsWithImages: gridCells.filter(cell => cell.imageId).length
      }, null, 2)
    });
    
    // 1. Calculate cell width (based on the container width)
    const containerWidth = 800; // In real implementation this should be dynamic
    const cellWidth = containerWidth / gridDimensions.cols;
    
    alignmentLog.push({
      timestamp,
      message: 'Step 1: Calculate cell width',
      data: JSON.stringify({ containerWidth, cellWidth }, null, 2)
    });
    
    // 2. First pass: Scale all bounding box widths to cellWidth (while respecting aspect ratio)
    for (const cell of updatedGridCells) {
      if (!cell.imageId) continue;
      
      const imageObj = images.find(img => img.id === cell.imageId);
      if (!imageObj) continue;
      
      const scaleFactor = cellWidth / imageObj.bbWidth;
      cell.scaleX = scaleFactor;
      cell.scaleY = scaleFactor; // Maintain aspect ratio initially
      
      alignmentLog.push({
        timestamp,
        message: `Step 2: Scale cell R${cell.row + 1}:C${cell.col + 1} bounding box`,
        data: JSON.stringify({
          originalBBWidth: imageObj.bbWidth,
          originalBBHeight: imageObj.bbHeight,
          scaleFactor,
          newBBWidth: imageObj.bbWidth * scaleFactor,
          newBBHeight: imageObj.bbHeight * scaleFactor
        }, null, 2)
      });
    }
    
    // 3. Group cells by column for horizontal alignment
    const columnGroups = {};
    for (let col = 0; col < gridDimensions.cols; col++) {
      columnGroups[col] = updatedGridCells.filter(cell => cell.col === col && cell.imageId !== null);
    }
    
    alignmentLog.push({
      timestamp,
      message: 'Step 3: Group cells by column',
      data: JSON.stringify({ 
        columnGroups: Object.entries(columnGroups).reduce((acc, [col, cells]) => {
          acc[col] = cells.map(c => `R${c.row + 1}:C${c.col + 1}`);
          return acc;
        }, {}) 
      }, null, 2)
    });
    
    // 4. First pass alignment: Align each column by bbLeftOffset
    for (let col = 0; col < gridDimensions.cols; col++) {
      const colCells = columnGroups[col];
      if (colCells.length === 0) continue;
      
      // Find cell with maximum bbLeftOffset
      let maxBBLeftOffset = 0;
      for (const cell of colCells) {
        const imageObj = images.find(img => img.id === cell.imageId);
        if (!imageObj) continue;
        
        const bbLeftOffset = imageObj.bbLeftOffset * cell.scaleX;
        if (bbLeftOffset > maxBBLeftOffset) {
          maxBBLeftOffset = bbLeftOffset;
        }
      }
      
      alignmentLog.push({
        timestamp,
        message: `Step 4: Column ${col + 1} max bbLeftOffset`,
        data: JSON.stringify({ maxBBLeftOffset }, null, 2)
      });
      
      // Apply horizontal offset to all cells in column
      for (const cell of colCells) {
        const imageObj = images.find(img => img.id === cell.imageId);
        if (!imageObj) continue;
        
        const bbLeftOffset = imageObj.bbLeftOffset * cell.scaleX;
        const horizontalOffset = maxBBLeftOffset - bbLeftOffset;
        
        // Store the horizontal offset for rendering
        cell.horizontalOffset = horizontalOffset;
        
        alignmentLog.push({
          timestamp,
          message: `Step 4: Apply horizontal offset to R${cell.row + 1}:C${cell.col + 1}`,
          data: JSON.stringify({
            bbLeftOffset,
            maxBBLeftOffset,
            horizontalOffset
          }, null, 2)
        });
      }
    }
    
    // 5. Group cells by row for vertical alignment
    const rowGroups = {};
    for (let row = 0; row < gridDimensions.rows; row++) {
      rowGroups[row] = updatedGridCells.filter(cell => cell.row === row && cell.imageId !== null);
    }
    
    alignmentLog.push({
      timestamp,
      message: 'Step 5: Group cells by row',
      data: JSON.stringify({ 
        rowGroups: Object.entries(rowGroups).reduce((acc, [row, cells]) => {
          acc[row] = cells.map(c => `R${c.row + 1}:C${c.col + 1}`);
          return acc;
        }, {}) 
      }, null, 2)
    });
    
    // 6. Second pass: Find max bbHeight in each row and stretch others to match
    for (let row = 0; row < gridDimensions.rows; row++) {
      const rowCells = rowGroups[row];
      if (rowCells.length === 0) continue;
      
      // Find maximum bbHeight in the row
      let maxBBHeight = 0;
      let maxBBHeightCell = null;
      
      for (const cell of rowCells) {
        const imageObj = images.find(img => img.id === cell.imageId);
        if (!imageObj) continue;
        
        const bbHeight = imageObj.bbHeight * cell.scaleY;
        if (bbHeight > maxBBHeight) {
          maxBBHeight = bbHeight;
          maxBBHeightCell = cell;
        }
      }
      
      alignmentLog.push({
        timestamp,
        message: `Step 6: Row ${row + 1} max bbHeight`,
        data: JSON.stringify({ 
          maxBBHeight, 
          maxBBHeightCellRow: maxBBHeightCell ? maxBBHeightCell.row + 1 : null,
          maxBBHeightCellCol: maxBBHeightCell ? maxBBHeightCell.col + 1 : null
        }, null, 2)
      });
      
      // Stretch other cells in the row to match the max height
      for (const cell of rowCells) {
        if (cell === maxBBHeightCell) continue;
        
        const imageObj = images.find(img => img.id === cell.imageId);
        if (!imageObj) continue;
        
        const currentBBHeight = imageObj.bbHeight * cell.scaleY;
        const verticalStretchFactor = maxBBHeight / currentBBHeight;
        
        // Adjust the vertical scale while keeping horizontal scale the same
        cell.scaleY = cell.scaleY * verticalStretchFactor;
        
        alignmentLog.push({
          timestamp,
          message: `Step 6: Stretch cell R${cell.row + 1}:C${cell.col + 1} vertically`,
          data: JSON.stringify({
            currentBBHeight,
            maxBBHeight,
            verticalStretchFactor,
            newScaleY: cell.scaleY
          }, null, 2)
        });
      }
    }
    
    // 7. Third pass: Align by bbTopOffset within each row
    for (let row = 0; row < gridDimensions.rows; row++) {
      const rowCells = rowGroups[row];
      if (rowCells.length === 0) continue;
      
      // Find max bbTopOffset in the row
      let maxBBTopOffset = 0;
      for (const cell of rowCells) {
        const imageObj = images.find(img => img.id === cell.imageId);
        if (!imageObj) continue;
        
        const bbTopOffset = imageObj.bbTopOffset * cell.scaleY;
        if (bbTopOffset > maxBBTopOffset) {
          maxBBTopOffset = bbTopOffset;
        }
      }
      
      alignmentLog.push({
        timestamp,
        message: `Step 7: Row ${row + 1} max bbTopOffset`,
        data: JSON.stringify({ maxBBTopOffset }, null, 2)
      });
      
      // Apply vertical offset to all cells in row
      for (const cell of rowCells) {
        const imageObj = images.find(img => img.id === cell.imageId);
        if (!imageObj) continue;
        
        const bbTopOffset = imageObj.bbTopOffset * cell.scaleY;
        const verticalOffset = maxBBTopOffset - bbTopOffset;
        
        // Store the vertical offset for rendering
        cell.verticalOffset = verticalOffset;
        
        alignmentLog.push({
          timestamp,
          message: `Step 7: Apply vertical offset to R${cell.row + 1}:C${cell.col + 1}`,
          data: JSON.stringify({
            bbTopOffset,
            maxBBTopOffset,
            verticalOffset
          }, null, 2)
        });
      }
    }
    
    // 8. Calculate column offsets based on widths of previous columns
    const columnOffsets = {};
    let cumulativeColumnOffset = 0;
    
    for (let col = 0; col < gridDimensions.cols; col++) {
      columnOffsets[col] = cumulativeColumnOffset;
      
      if (columnGroups[col].length > 0) {
        // Find max combined image width + horizontal offset in this column
        let maxTotalWidth = 0;
        
        for (const cell of columnGroups[col]) {
          const imageObj = images.find(img => img.id === cell.imageId);
          if (!imageObj) continue;
          
          const imageWidth = imageObj.width * cell.scaleX;
          const horizontalOffset = cell.horizontalOffset || 0;
          const totalWidth = imageWidth + horizontalOffset;
          
          if (totalWidth > maxTotalWidth) {
            maxTotalWidth = totalWidth;
          }
        }
        
        // Add horizontal spacing
        if (col < gridDimensions.cols - 1) {
          maxTotalWidth += spacing.horizontal;
        }
        
        cumulativeColumnOffset += maxTotalWidth;
      }
    }
    
    alignmentLog.push({
      timestamp,
      message: 'Step 8: Calculate column offsets',
      data: JSON.stringify({ columnOffsets }, null, 2)
    });
    
    // 9. Calculate row offsets based on heights of previous rows
    const rowOffsets = {};
    let cumulativeRowOffset = 0;
    
    for (let row = 0; row < gridDimensions.rows; row++) {
      rowOffsets[row] = cumulativeRowOffset;
      
      if (rowGroups[row].length > 0) {
        // Find max combined image height + vertical offset in this row
        let maxTotalHeight = 0;
        
        for (const cell of rowGroups[row]) {
          const imageObj = images.find(img => img.id === cell.imageId);
          if (!imageObj) continue;
          
          const imageHeight = imageObj.height * cell.scaleY;
          const verticalOffset = cell.verticalOffset || 0;
          const totalHeight = imageHeight + verticalOffset;
          
          if (totalHeight > maxTotalHeight) {
            maxTotalHeight = totalHeight;
          }
        }
        
        // Add vertical spacing
        if (row < gridDimensions.rows - 1) {
          maxTotalHeight += spacing.vertical;
        }
        
        cumulativeRowOffset += maxTotalHeight;
      }
    }
    
    alignmentLog.push({
      timestamp,
      message: 'Step 9: Calculate row offsets',
      data: JSON.stringify({ rowOffsets }, null, 2)
    });
    
    // 10. Apply column and row offsets
    for (const cell of updatedGridCells) {
      if (!cell.imageId) continue;
      
      if (cell.col > 0) {
        cell.columnOffset = columnOffsets[cell.col];
      } else {
        cell.columnOffset = 0;
      }
      
      if (cell.row > 0) {
        cell.rowOffset = rowOffsets[cell.row];
      } else {
        cell.rowOffset = 0;
      }
      
      alignmentLog.push({
        timestamp,
        message: `Step 10: Apply offsets to R${cell.row + 1}:C${cell.col + 1}`,
        data: JSON.stringify({
          columnOffset: cell.columnOffset,
          rowOffset: cell.rowOffset
        }, null, 2)
      });
    }
    
    // 11. Calculate the total grid dimensions required
    const totalWidth = cumulativeColumnOffset;
    const totalHeight = cumulativeRowOffset;
    
    alignmentLog.push({
      timestamp,
      message: 'Step 11: Total grid dimensions',
      data: JSON.stringify({ 
        totalWidth, 
        totalHeight 
      }, null, 2)
    });
    
    alignmentLog.push({
      timestamp,
      message: 'Image alignment complete'
    });
    
    return {
      updatedGridCells,
      alignmentLog,
      dimensions: {
        width: totalWidth,
        height: totalHeight
      }
    };
  },
  
  /**
   * Create a grid image for export
   * @param {HTMLCanvasElement} canvas - Canvas element to render to
   * @param {Array} gridCells - The grid cells
   * @param {Array} images - The images
   * @param {Object} gridDimensions - Grid dimensions
   * @param {Object} spacing - Spacing settings
   * @returns {HTMLCanvasElement} The canvas with rendered grid
   */
  createGridImage(canvas, gridCells, images, gridDimensions, spacing) {
    if (!canvas) return null;
    
    // Get the filled cells
    const filledCells = gridCells.filter(cell => cell.imageId);
    
    if (filledCells.length === 0) return null;
    
    // Calculate total dimensions needed
    let maxWidth = 0;
    let maxHeight = 0;
    
    filledCells.forEach(cell => {
      const imageObj = images.find(img => img.id === cell.imageId);
      if (!imageObj) return;
      
      const imageWidth = imageObj.width * (cell.scaleX || 1);
      const imageHeight = imageObj.height * (cell.scaleY || 1);
      
      const right = (cell.columnOffset || 0) + imageWidth + (cell.horizontalOffset || 0);
      const bottom = (cell.rowOffset || 0) + imageHeight + (cell.verticalOffset || 0);
      
      maxWidth = Math.max(maxWidth, right);
      maxHeight = Math.max(maxHeight, bottom);
    });
    
    // Set canvas dimensions
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw each image onto the canvas
    filledCells.forEach(cell => {
      const imageObj = images.find(img => img.id === cell.imageId);
      if (!imageObj || !imageObj.image) return;
      
      const x = (cell.columnOffset || 0) + (cell.horizontalOffset || 0);
      const y = (cell.rowOffset || 0) + (cell.verticalOffset || 0);
      
      // Draw the entire image
      ctx.drawImage(
        imageObj.image,
        0, 0, imageObj.width, imageObj.height,
        x, y, imageObj.width * cell.scaleX, imageObj.height * cell.scaleY
      );
    });
    
    return canvas;
  }
};