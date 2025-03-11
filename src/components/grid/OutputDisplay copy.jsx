import React from 'react';
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
          {/* Output content will go here */}
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
