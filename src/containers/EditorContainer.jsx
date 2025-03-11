import React from 'react';
import { useImageContext, IMAGE_ACTIONS } from '../context/ImageContext';
import { useImageProcessing } from '../hooks/useImageProcessing';
import { useFileOperations } from '../hooks/useFileOperations';
import ImageUploader from '../components/imageEditor/ImageUploader';
import ImageList from '../components/imageEditor/ImageList';
import BoundingBoxEditor from '../components/imageEditor/BoundingBoxEditor';

const EditorContainer = () => {
  const { state, dispatch } = useImageContext();
  const { imageObjects, selectedImageId } = state;
  
  const { processImages, clearAllImages } = useImageProcessing();
  
  const { isDragging, handleDrop, handleDragOver, handleDragLeave, handleFiles } = 
    useFileOperations({ onFiles: processImages });
  
  const handleSelectImage = (id) => {
    dispatch({ type: IMAGE_ACTIONS.SELECT_IMAGE, payload: id });
  };
  
  const handleUpdateBoundingBox = (updates) => {
    if (!selectedImageId) return;
    
    // Check if we have cropBbox updates
    if (updates.cropBbox) {
      dispatch({
        type: IMAGE_ACTIONS.UPDATE_CROP,
        payload: {
          imageId: selectedImageId,
          updates: {
            cropBbox: updates.cropBbox
          }
        }
      });
    }
    
    // Check if we have normal bounding box updates
    const bboxUpdates = {};
    if (updates.bbLeftOffset !== undefined) bboxUpdates.bbLeftOffset = updates.bbLeftOffset;
    if (updates.bbTopOffset !== undefined) bboxUpdates.bbTopOffset = updates.bbTopOffset;
    if (updates.bbWidth !== undefined) bboxUpdates.bbWidth = updates.bbWidth;
    if (updates.bbHeight !== undefined) bboxUpdates.bbHeight = updates.bbHeight;
    
    if (Object.keys(bboxUpdates).length > 0) {
      dispatch({
        type: IMAGE_ACTIONS.UPDATE_BOUNDING_BOX,
        payload: {
          imageId: selectedImageId,
          updates: bboxUpdates
        }
      });
    }
  };
  const selectedImage = imageObjects.find(img => img.id === selectedImageId);
  
  return (
    <div className="flex flex-col bg-white rounded-xl shadow-lg border border-pink-200 mb-6">
      <div className="p-4 border-b border-pink-200 bg-pink-50">
        <ImageUploader 
          onProcess={processImages} 
          onClear={clearAllImages}
          isDragging={isDragging}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        />
      </div>
      
      <div className="flex">
        <div className="w-1/4 border-r border-pink-100 p-4 overflow-y-auto max-h-[600px]">
          <ImageList 
            images={imageObjects}
            selectedImageId={selectedImageId}
            onSelectImage={handleSelectImage}
          />
        </div>
        
        <div className="w-3/4 p-4 overflow-y-auto max-h-[600px]">
          {selectedImage ? (
            <BoundingBoxEditor 
              image={selectedImage}
              onUpdate={handleUpdateBoundingBox}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-pink-400 p-8 bg-pink-50 rounded-lg border border-pink-100">
              <h2 className="text-xl font-medium mb-2">No Image Selected</h2>
              <p className="text-center text-pink-500">
                Upload images using the button above or paste from clipboard, then select an image to edit its bounding box.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorContainer;
