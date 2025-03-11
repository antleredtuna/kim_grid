import React, { useEffect, useState } from 'react';
import Button from '../common/Button';

const OutputDisplay = ({ 
  gridCells, 
  images, 
  spacing, 
  canvasRef, 
  createGridImage,
  onExportJson,
  onExportImage
}) => {
  const filledCells = gridCells.filter(cell => cell.imageId);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  
  // Generate preview image when grid cells change
  useEffect(() => {
    if (filledCells.length === 0 || !canvasRef.current || typeof createGridImage !== 'function') {
      setPreviewImageUrl(null);
      return;
    }
    
    try {
      // Create grid image and generate preview
      const canvas = createGridImage(canvasRef.current);
      if (canvas) {
        setPreviewImageUrl(canvas.toDataURL('image/png'));
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      setPreviewImageUrl(null);
    }
  }, [filledCells, createGridImage, canvasRef]);
  
  return (
    <div className="border border-pink-200 rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="p-3 bg-pink-100 border-b border-pink-200 font-medium flex items-center text-pink-800">
        Output & Export
      </div>
      
      <div className="p-4 bg-white">
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <Button
            onClick={onExportJson}
            disabled={filledCells.length === 0}
            variant="secondary"
          >
            Export JSON
          </Button>
          
          <Button
            onClick={onExportImage}
            disabled={filledCells.length === 0}
            variant="primary"
          >
            Export Grid Image
          </Button>
          
          {filledCells.length === 0 && (
            <div className="text-sm text-pink-500 ml-2">
              Add images to the grid and align them first
            </div>
          )}
        </div>
        
        <div className="bg-pink-50 rounded-lg p-4 max-h-60 overflow-y-auto shadow-inner border border-pink-100">
          {previewImageUrl ? (
            <div className="flex flex-col items-center">
              <p className="text-sm text-pink-600 mb-2">Preview:</p>
              <div className="border border-pink-200 bg-white p-1 rounded">
                <img 
                  src={previewImageUrl} 
                  alt="Aligned grid preview" 
                  className="max-w-full max-h-48 object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-pink-400 py-4">
              {filledCells.length > 0 
                ? "Align images to generate a preview" 
                : "Add images to the grid first"}
            </div>
          )}
        </div>
        
        {/* Hidden canvas for export */}
        <canvas 
          ref={canvasRef} 
          style={{ display: 'none' }} 
        />
      </div>
    </div>
  );
};

export default OutputDisplay;