import React, { useRef } from 'react';
import { useImageContext } from '../context/ImageContext';
import { useGridContext, GRID_ACTIONS } from '../context/GridContext';
import { useGridOperations } from '../hooks/useGridOperations';
import { useAlignment } from '../hooks/useAlignment';
import { exportService } from '../services/exportService';
import GridControls from '../components/grid/GridControls';
import GridDisplay from '../components/grid/GridDisplay';
import ImageList from '../components/imageEditor/ImageList';
import OutputDisplay from '../components/grid/OutputDisplay';
import AlignmentLog from '../components/grid/AlignmentLog';

const GridContainer = () => {
  const { state: imageState, dispatch: imageDispatch } = useImageContext();
  const { state: gridState, dispatch: gridDispatch } = useGridContext();
  const { 
    gridDimensions, 
    gridCells,
    selectedCellIndex,
    spacing,
    updateGridDimensions,
    selectCell,
    clearSelectedCell,
    updateSpacing
  } = useGridOperations();
  
  const { alignImages, alignmentLog, isAligned } = useAlignment();
  
  const outputCanvasRef = useRef(null);
  
  const { imageObjects, selectedImageId } = imageState;
  
  const handleExportJson = () => {
    exportService.exportAsJson(gridCells, imageObjects, spacing);
  };
  
  const handleExportImage = () => {
    exportService.exportAsImage(gridCells, imageObjects, spacing);
  };
  
  // Check if an image is assigned to any cell
  const isImageAssigned = (imageId) => {
    return gridCells.some(cell => cell.imageId === imageId);
  };
  
  // Handle selecting an image
  const handleSelectImage = (imageId) => {
    imageDispatch({
      type: 'SELECT_IMAGE',
      payload: imageId
    });
  };
  
  // Handle placing an image in a cell
  const handleAssignToCell = (cellIndex, imageId) => {
    // If no image is explicitly provided, use the selected image
    const targetImageId = imageId || selectedImageId;
    
    if (!targetImageId) return;
    
    // Assign the image to the cell
    gridDispatch({
      type: GRID_ACTIONS.ASSIGN_IMAGE_TO_CELL,
      payload: {
        cellIndex,
        imageId: targetImageId
      }
    });
    
    // Also select the cell
    gridDispatch({
      type: GRID_ACTIONS.SELECT_CELL,
      payload: cellIndex
    });
  };
  
  // Handle removing an image from a cell
  const handleRemoveFromCell = (cellIndex) => {
    gridDispatch({
      type: GRID_ACTIONS.CLEAR_CELL,
      payload: cellIndex
    });
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-lg border border-pink-200 mb-6">
      <div className="p-4 border-b border-pink-200 bg-pink-50">
        <GridControls 
          gridDimensions={gridDimensions}
          onUpdateGrid={updateGridDimensions}
          spacing={spacing}
          onUpdateSpacing={updateSpacing}
          onAlignImages={alignImages}
          gridCells={gridCells}
        />
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/4 border-r border-pink-100 overflow-y-auto p-4">
          <ImageList 
            images={imageObjects}
            selectedImageId={selectedImageId}
            onSelectImage={handleSelectImage}
            showAssignedState={true}
            getAssignedState={isImageAssigned}
            allowDragDrop={true}
          />
        </div>
        
        <div className="w-3/4 flex flex-col overflow-hidden p-4" style={{ minHeight: '500px' }}>
          <div className="flex-1 overflow-hidden">
            <GridDisplay 
              gridCells={gridCells}
              gridDimensions={gridDimensions}
              images={imageObjects}
              selectedCellIndex={selectedCellIndex}
              onSelectCell={selectCell}
              spacing={spacing}
              isAligned={isAligned}
              onAssignImage={handleAssignToCell}
              onRemoveImage={handleRemoveFromCell}
              selectedImageId={selectedImageId}
            />
          </div>
            
          <div className="mt-4 overflow-y-auto max-h-60">
            <OutputDisplay 
              gridCells={gridCells}
              images={imageObjects}
              spacing={spacing}
              canvasRef={outputCanvasRef}
              onExportJson={handleExportJson}
              onExportImage={handleExportImage}
            />
            
            {alignmentLog.length > 0 && (
              <AlignmentLog log={alignmentLog} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridContainer;