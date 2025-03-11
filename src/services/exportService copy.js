import { saveAs } from 'file-saver';
import { calculateGridDimensions } from '../utils/exportUtils';

/**
 * Service for exporting grid data
 */
export const exportService = {
  /**
   * Export the grid as JSON
   * @param {Array} gridCells - The grid cells
   * @param {Array} images - The images
   * @param {Object} spacing - The spacing configuration
   */
  exportAsJson(gridCells, images, spacing) {
    const outputObjects = gridCells
      .filter(cell => cell.imageId)
      .map(cell => {
        const imageObj = images.find(img => img.id === cell.imageId);
        if (!imageObj) return null;
        
        // Calculate bounding box after scaling
        const bbWidth = imageObj.bbWidth * cell.scaleX;
        const bbHeight = imageObj.bbHeight * cell.scaleY;
        const bbLeftOffset = imageObj.bbLeftOffset * cell.scaleX;
        const bbTopOffset = imageObj.bbTopOffset * cell.scaleY;
        
        // Apply offsets
        const horizontalOffset = cell.horizontalOffset || 0;
        const verticalOffset = cell.verticalOffset || 0;
        const columnOffset = cell.columnOffset || 0;
        const rowOffset = cell.rowOffset || 0;
        
        return {
          id: cell.imageId,
          filename: imageObj.filename,
          row: cell.row,
          col: cell.col,
          width: Math.round(imageObj.width * cell.scaleX),
          height: Math.round(imageObj.height * cell.scaleY),
          bbWidth: Math.round(bbWidth),
          bbHeight: Math.round(bbHeight),
          bbLeftOffset: Math.round(bbLeftOffset),
          bbTopOffset: Math.round(bbTopOffset),
          horizontalOffset: Math.round(horizontalOffset),
          verticalOffset: Math.round(verticalOffset),
          columnOffset: Math.round(columnOffset),
          rowOffset: Math.round(rowOffset),
          scaleX: cell.scaleX,
          scaleY: cell.scaleY,
          horizontalSpacing: spacing.horizontal,
          verticalSpacing: spacing.vertical
        };
      })
      .filter(Boolean);
    
    const dataStr = JSON.stringify(outputObjects, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    saveAs(blob, 'grid-aligned-images.json');
  },
  
  /**
   * Export the grid as an image
   * @param {Array} gridCells - The grid cells
   * @param {Array} images - The images
   * @param {Object} spacing - The spacing configuration
   * @returns {Promise} Promise that resolves when export is complete
   */
  exportAsImage(gridCells, images, spacing) {
    return new Promise((resolve, reject) => {
      try {
        // Implementation to be migrated from existing code
      } catch (error) {
        reject(error);
      }
    });
  }
};
