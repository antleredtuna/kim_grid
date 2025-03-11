import React, { createContext, useReducer, useContext } from 'react';

// Define initial state
const initialState = {
  imageObjects: [],
  selectedImageId: null,
};

// Create context
const ImageContext = createContext();

// Define actions
export const IMAGE_ACTIONS = {
  ADD_IMAGES: 'ADD_IMAGES',
  SELECT_IMAGE: 'SELECT_IMAGE',
  UPDATE_BOUNDING_BOX: 'UPDATE_BOUNDING_BOX',
  UPDATE_CROP: 'UPDATE_CROP',
  CLEAR_ALL: 'CLEAR_ALL',
};

// Reducer function
function imageReducer(state, action) {
  switch (action.type) {
    case IMAGE_ACTIONS.ADD_IMAGES:
      return { ...state, imageObjects: [...state.imageObjects, ...action.payload] };
    case IMAGE_ACTIONS.SELECT_IMAGE:
      return { ...state, selectedImageId: action.payload };
    case IMAGE_ACTIONS.UPDATE_BOUNDING_BOX:
      return { 
        ...state, 
        imageObjects: state.imageObjects.map(img => 
          img.id === action.payload.imageId 
            ? { ...img, ...action.payload.updates } 
            : img
        )
      };
    case IMAGE_ACTIONS.UPDATE_CROP:
      return {
        ...state,
        imageObjects: state.imageObjects.map(img => 
          img.id === action.payload.imageId 
            ? { ...img, cropBbox: action.payload.updates.cropBbox } 
            : img
        )
      };
    case IMAGE_ACTIONS.CLEAR_ALL:
      return { ...initialState };
    default:
      return state;
  }
}

// Provider component
export function ImageProvider({ children }) {
  const [state, dispatch] = useReducer(imageReducer, initialState);
  
  return (
    <ImageContext.Provider value={{ state, dispatch }}>
      {children}
    </ImageContext.Provider>
  );
}

// Custom hook to use the context
export function useImageContext() {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImageContext must be used within an ImageProvider');
  }
  return context;
}
