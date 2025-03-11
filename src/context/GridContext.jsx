import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { gridService } from '../services/gridService';

// Define initial state
const initialState = {
  gridCells: [],
  gridDimensions: { rows: 2, cols: 2 },
  selectedCellIndex: null,
  spacing: { horizontal: 10, vertical: 10 },
  isAligned: false,
  alignmentLog: [],
};

// Create context
const GridContext = createContext();

// Define actions
export const GRID_ACTIONS = {
  UPDATE_GRID_DIMENSIONS: 'UPDATE_GRID_DIMENSIONS',
  INITIALIZE_GRID: 'INITIALIZE_GRID',
  SELECT_CELL: 'SELECT_CELL',
  ASSIGN_IMAGE_TO_CELL: 'ASSIGN_IMAGE_TO_CELL',
  CLEAR_CELL: 'CLEAR_CELL',
  UPDATE_SPACING: 'UPDATE_SPACING',
  ALIGN_GRID: 'ALIGN_GRID',
  UPDATE_GRID_CELLS: 'UPDATE_GRID_CELLS',
  ADD_ALIGNMENT_LOG: 'ADD_ALIGNMENT_LOG',
  CLEAR_ALIGNMENT: 'CLEAR_ALIGNMENT',
};

// Reducer function
function gridReducer(state, action) {
  switch (action.type) {
    case GRID_ACTIONS.UPDATE_GRID_DIMENSIONS:
      return { ...state, gridDimensions: action.payload };
    case GRID_ACTIONS.INITIALIZE_GRID:
      return { ...state, gridCells: action.payload, selectedCellIndex: null };
    case GRID_ACTIONS.SELECT_CELL:
      return { ...state, selectedCellIndex: action.payload };
    case GRID_ACTIONS.ASSIGN_IMAGE_TO_CELL: {
      const { cellIndex, imageId } = action.payload;
      return { 
        ...state, 
        gridCells: state.gridCells.map((cell, index) => 
          index === cellIndex 
            ? { ...cell, imageId, scaleX: 1, scaleY: 1 } 
            : cell
        )
      };
    }
    case GRID_ACTIONS.CLEAR_CELL: {
      if (state.selectedCellIndex === null) return state;
      return {
        ...state,
        gridCells: state.gridCells.map((cell, index) =>
          index === state.selectedCellIndex
            ? { ...cell, imageId: null }
            : cell
        )
      };
    }
    case GRID_ACTIONS.UPDATE_SPACING:
      return { ...state, spacing: action.payload };
    case GRID_ACTIONS.ALIGN_GRID:
      return { ...state, isAligned: action.payload };
    case GRID_ACTIONS.UPDATE_GRID_CELLS:
      return { ...state, gridCells: action.payload };
    case GRID_ACTIONS.ADD_ALIGNMENT_LOG:
      return { ...state, alignmentLog: [...state.alignmentLog, ...action.payload] };
    case GRID_ACTIONS.CLEAR_ALIGNMENT:
      return { ...state, isAligned: false, alignmentLog: [] };
    default:
      return state;
  }
}

// Provider component
export function GridProvider({ children }) {
  const [state, dispatch] = useReducer(gridReducer, initialState);
  
  // Initialize the grid on mount
  useEffect(() => {
    const newGridCells = gridService.initializeGrid(state.gridDimensions);
    dispatch({ 
      type: GRID_ACTIONS.INITIALIZE_GRID, 
      payload: newGridCells 
    });
  }, []);
  
  return (
    <GridContext.Provider value={{ state, dispatch }}>
      {children}
    </GridContext.Provider>
  );
}

// Custom hook to use the context
export function useGridContext() {
  const context = useContext(GridContext);
  if (!context) {
    throw new Error('useGridContext must be used within a GridProvider');
  }
  return context;
}