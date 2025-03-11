import React, { useRef } from 'react';
import { useImageContext } from '../context/ImageContext';
import { useGridContext } from '../context/GridContext';
import { useAlignment } from '../hooks/useAlignment';
import { exportService } from '../services/exportService';
import OutputDisplay from '../components/grid/OutputDisplay';
import AlignmentLog from '../components/grid/AlignmentLog';

/**
 * Container component for alignment functionality
 * Handles alignment logic and rendering of alignment-related UI components
 */
const AlignmentContainer = () => {
  const { state: imageState } = useImageContext();
  const { state: gridState } = useGridContext();
  const { gridCells, alignmentLog, spacing } = gridState;
  const { imageObjects } = imageState;
  
  const { alignImages, createGridImage, isAligned } = useAlignment();
  
  const outputCanvasRef = useRef(null);
  
  // Export handlers
  const handleExportJson = () => {
    exportService.exportAsJson(gridCells, imageObjects, spacing);
  };
  
  const handleExportImage = () => {
    exportService.exportAsImage(gridCells, imageObjects, spacing);
  };
  
  return (
    <div className="mt-4 overflow-y-auto">
      <OutputDisplay 
        gridCells={gridCells}
        images={imageObjects}
        spacing={spacing}
        canvasRef={outputCanvasRef}
        createGridImage={createGridImage}
        onExportJson={handleExportJson}
        onExportImage={handleExportImage}
      />
      
      {alignmentLog.length > 0 && (
        <AlignmentLog log={alignmentLog} />
      )}
    </div>
  );
};

export default AlignmentContainer;