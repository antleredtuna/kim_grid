import { useCallback } from 'react';
import { useGridContext, GRID_ACTIONS } from '../context/GridContext';
import { useImageContext } from '../context/ImageContext';
import { gridService } from '../services/gridService';

/**
 * Hook for alignment operations
 */
export function useAlignment() {
  const { state: gridState, dispatch: gridDispatch } = useGridContext();
  const { state: imageState } = useImageContext();
  
  const { gridCells, gridDimensions, spacing, alignmentLog, isAligned } = gridState;
  const { imageObjects } = imageState;
  
  /**
   * Align images in the grid
   */
  const alignImages = useCallback(() => {
    // Check if there are any images in the grid
    const filledCells = gridCells.filter(cell => cell.imageId !== null);
    if (filledCells.length === 0) {
      alert('Please add at least one image to the grid before aligning');
      return;
    }

    const { updatedGridCells, alignmentLog } = gridService.alignImages(
      gridCells,
      imageObjects,
      gridDimensions,
      spacing
    );
    
    // Update grid cells with alignment results
    gridDispatch({
      type: GRID_ACTIONS.UPDATE_GRID_CELLS,
      payload: updatedGridCells
    });
    
    // Add alignment log entries
    gridDispatch({
      type: GRID_ACTIONS.ADD_ALIGNMENT_LOG,
      payload: alignmentLog
    });
    
    // Set alignment status
    gridDispatch({
      type: GRID_ACTIONS.ALIGN_GRID,
      payload: true
    });
  }, [gridCells, imageObjects, gridDimensions, spacing, gridDispatch]);
  
  /**
   * Create a grid image for export
   * @param {HTMLCanvasElement} canvas - Canvas element to render to
   * @returns {HTMLCanvasElement} Canvas with rendered grid
   */
  const createGridImage = useCallback((canvas) => {
    if (!canvas) return null;
    
    try {
      return gridService.createGridImage(
        canvas,
        gridCells,
        imageObjects,
        gridDimensions,
        spacing
      );
    } catch (error) {
      console.error('Error creating grid image:', error);
      return null;
    }
  }, [gridCells, imageObjects, gridDimensions, spacing]);
  
  return {
    alignImages,
    createGridImage,
    alignmentLog,
    isAligned
  };
}