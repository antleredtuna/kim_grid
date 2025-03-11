import { useState, useCallback } from 'react';
import { imageService } from '../services/imageService';
import { useImageContext, IMAGE_ACTIONS } from '../context/ImageContext';

/**
 * Hook for image processing functionality
 */
export function useImageProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [snapToEdges, setSnapToEdges] = useState(true);
  const { state, dispatch } = useImageContext();
  
  const processImages = useCallback(async (files) => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      console.log("Processing", files.length, "images with snapToEdges:", snapToEdges);
      const processedImages = await imageService.processImages(files, snapToEdges);
      
      if (processedImages.length > 0) {
        console.log("Processed images:", processedImages.length);
        dispatch({
          type: IMAGE_ACTIONS.ADD_IMAGES,
          payload: processedImages
        });
        
        // Automatically select the first image if none is currently selected
        if (!state.selectedImageId) {
          dispatch({
            type: IMAGE_ACTIONS.SELECT_IMAGE,
            payload: processedImages[0].id
          });
        }
      }
      
      return processedImages;
    } catch (error) {
      console.error("Error processing images:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, state.selectedImageId, snapToEdges]);
  
  const clearAllImages = useCallback(() => {
    // Clean up object URLs before clearing
    imageService.cleanupImages(state.imageObjects);
    
    dispatch({ type: IMAGE_ACTIONS.CLEAR_ALL });
  }, [dispatch, state.imageObjects]);
  
  const toggleSnapToEdges = useCallback((value) => {
    setSnapToEdges(value);
  }, []);
  
  return {
    processImages,
    clearAllImages,
    isProcessing,
    snapToEdges,
    toggleSnapToEdges
  };
}
