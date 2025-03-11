import { useCallback, useEffect } from 'react';
import { useGridContext, GRID_ACTIONS } from '../context/GridContext';
import { gridService } from '../services/gridService';

/**
 * Hook for grid operations
 */
export function useGridOperations() {
  const { state, dispatch } = useGridContext();
  const { gridDimensions, gridCells, selectedCellIndex, spacing } = state;
  
  // Ensure grid is initialized
  useEffect(() => {
    if (gridCells.length === 0) {
      const newGridCells = gridService.initializeGrid(gridDimensions);
      dispatch({ 
        type: GRID_ACTIONS.INITIALIZE_GRID, 
        payload: newGridCells 
      });
    }
  }, [gridCells.length, gridDimensions, dispatch]);
  
  const updateGridDimensions = useCallback((rows, cols) => {
    const newDimensions = { rows, cols };
    dispatch({ 
      type: GRID_ACTIONS.UPDATE_GRID_DIMENSIONS, 
      payload: newDimensions 
    });
    
    const newGridCells = gridService.initializeGrid(newDimensions);
    dispatch({ 
      type: GRID_ACTIONS.INITIALIZE_GRID, 
      payload: newGridCells 
    });
  }, [dispatch]);
  
  const selectCell = useCallback((index) => {
    dispatch({ 
      type: GRID_ACTIONS.SELECT_CELL, 
      payload: index 
    });
  }, [dispatch]);
  
  const sendImageToCell = useCallback((imageId) => {
    if (selectedCellIndex === null) return;
    
    dispatch({ 
      type: GRID_ACTIONS.ASSIGN_IMAGE_TO_CELL, 
      payload: {
        cellIndex: selectedCellIndex,
        imageId
      }
    });
  }, [selectedCellIndex, dispatch]);
  
  const clearSelectedCell = useCallback(() => {
    if (selectedCellIndex === null) return;
    
    dispatch({ 
      type: GRID_ACTIONS.CLEAR_CELL,
      payload: selectedCellIndex
    });
  }, [selectedCellIndex, dispatch]);
  
  const updateSpacing = useCallback((newSpacing) => {
    dispatch({ 
      type: GRID_ACTIONS.UPDATE_SPACING, 
      payload: newSpacing 
    });
  }, [dispatch]);
  
  return {
    gridDimensions,
    gridCells,
    selectedCellIndex,
    spacing,
    updateGridDimensions,
    selectCell,
    sendImageToCell,
    clearSelectedCell,
    updateSpacing
  };
}