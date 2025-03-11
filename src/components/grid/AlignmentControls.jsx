import React, { useState } from 'react';
import Button from '../common/Button';

const AlignmentControls = ({
  gridDimensions,
  onUpdateGrid,
  spacing,
  onUpdateSpacing,
  onSendToCell,
  onClearCell,
  onAlignImages,
  cellHasImage,
  canSendToCell
}) => {
  const [rows, setRows] = useState(gridDimensions.rows);
  const [cols, setCols] = useState(gridDimensions.cols);
  const [horizontalSpacing, setHorizontalSpacing] = useState(spacing.horizontal);
  const [verticalSpacing, setVerticalSpacing] = useState(spacing.vertical);
  
  const handleUpdateGrid = () => {
    onUpdateGrid(Number(rows), Number(cols));
  };
  
  const handleUpdateSpacing = () => {
    onUpdateSpacing({
      horizontal: Number(horizontalSpacing),
      vertical: Number(verticalSpacing)
    });
  };
  
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-pink-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
        <div className="relative">
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-pink-800">Grid Dimensions</label>
          </div>
          <div className="flex items-center bg-pink-50 p-3 rounded-lg">
            <div className="flex items-center">
              <span className="text-xs font-medium text-pink-600 mr-2">Rows</span>
              <input
                type="number"
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                min="1"
                max="5"
                className="w-16 px-2 py-1 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-center"
              />
            </div>
            <span className="mx-3 text-pink-500">×</span>
            <div className="flex items-center">
              <span className="text-xs font-medium text-pink-600 mr-2">Columns</span>
              <input
                type="number"
                value={cols}
                onChange={(e) => setCols(e.target.value)}
                min="1"
                max="5"
                className="w-16 px-2 py-1 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-center"
              />
            </div>
            <button
              onClick={handleUpdateGrid}
              className="ml-4 bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm flex items-center"
            >
              Update Grid
            </button>
          </div>
        </div>
        
        <div className="relative">
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-pink-800">Spacing (pixels)</label>
          </div>
          <div className="flex items-center bg-pink-50 p-3 rounded-lg">
            {/* Spacing controls will go here */}
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={onSendToCell}
            disabled={!canSendToCell}
            variant="primary"
          >
            Send to Cell
          </Button>
          
          <Button
            onClick={onClearCell}
            disabled={!cellHasImage}
            variant="danger"
          >
            Clear Cell
          </Button>
        </div>
        
        <Button
          onClick={onAlignImages}
          variant="primary"
        >
          Align Images
        </Button>
      </div>
    </div>
  );
};

export default AlignmentControls;
