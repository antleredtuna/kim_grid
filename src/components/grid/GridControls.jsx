import React, { useState } from 'react';
import Button from '../common/Button';

const GridControls = ({
  gridDimensions,
  onUpdateGrid,
  spacing,
  onUpdateSpacing,
  onAlignImages,
  gridCells
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
  
  const hasImages = gridCells.some(cell => cell.imageId);
  
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-pink-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
        <div className="relative">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Update Grid
            </button>
          </div>
        </div>
        
        <div className="relative">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <label className="block text-sm font-medium text-pink-800">Spacing (pixels)</label>
          </div>
          <div className="flex items-center bg-pink-50 p-3 rounded-lg">
            <div className="flex items-center">
              <span className="text-xs font-medium text-pink-600 mr-2">Horizontal</span>
              <input
                type="number"
                value={horizontalSpacing}
                onChange={(e) => setHorizontalSpacing(e.target.value)}
                min="0"
                className="w-16 px-2 py-1 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-center"
              />
            </div>
            <span className="mx-3 text-pink-500">+</span>
            <div className="flex items-center">
              <span className="text-xs font-medium text-pink-600 mr-2">Vertical</span>
              <input
                type="number"
                value={verticalSpacing}
                onChange={(e) => setVerticalSpacing(e.target.value)}
                min="0"
                className="w-16 px-2 py-1 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-center"
              />
            </div>
            <button
              onClick={handleUpdateSpacing}
              className="ml-4 bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              Set Spacing
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={onAlignImages}
          disabled={!hasImages}
          variant="primary"
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-200 disabled:text-purple-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
          Align Images
        </Button>
      </div>
      
      {/* Helper tip */}
      <div className="mt-4 text-xs bg-pink-50 text-pink-600 p-2 rounded flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong>How to use:</strong> Drag and drop images from the left panel onto grid cells or select an image and then click on a grid cell to place it. Click "Align Images" when ready.
        </span>
      </div>
    </div>
  );
};

export default GridControls;
