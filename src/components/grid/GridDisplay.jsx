import React, { useRef, useEffect, useState } from 'react';

const GridDisplay = ({
  gridCells,
  gridDimensions,
  images,
  selectedCellIndex,
  onSelectCell,
  spacing,
  isAligned,
  onAssignImage,
  onRemoveImage,
  selectedImageId
}) => {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });
  const [dragOverCell, setDragOverCell] = useState(null);
  
  // Update container dimensions when it mounts or resizes
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      setContainerSize({ 
        width: containerWidth, 
        height: containerHeight 
      });
      
      // Calculate cell size
      const padding = 20; // Padding around the grid
      const availableWidth = containerWidth - padding * 2;
      const availableHeight = containerHeight - padding * 2;
      
      const cellWidth = Math.floor(availableWidth / gridDimensions.cols);
      const cellHeight = Math.floor(availableHeight / gridDimensions.rows);
      
      // Use the smaller dimension to keep cells square-ish
      const minSize = Math.min(cellWidth, cellHeight);
      
      setCellSize({
        width: minSize,
        height: minSize
      });
    };
    
    updateSize();
    
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [gridDimensions]);
  
  // Handle drag over
  const handleDragOver = (e, cellIndex) => {
    e.preventDefault();
    setDragOverCell(cellIndex);
    e.dataTransfer.dropEffect = 'copy';
  };
  
  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverCell(null);
  };
  
  // Handle drop
  const handleDrop = (e, cellIndex) => {
    e.preventDefault();
    setDragOverCell(null);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'image-drag' && data.imageId) {
        onAssignImage(cellIndex, data.imageId);
      }
    } catch (error) {
      console.error('Error processing drop:', error);
    }
  };
  
  // Handle cell click - either select or assign image
  const handleCellClick = (cellIndex) => {
    // If an image is selected, assign it to the clicked cell
    if (selectedImageId) {
      onAssignImage(cellIndex, selectedImageId);
    } else {
      // Otherwise just select the cell
      onSelectCell(cellIndex);
    }
  };
  
  // Handle removing image from cell
  const handleRemoveImage = (e, cellIndex) => {
    e.stopPropagation(); // Prevent cell selection
    onRemoveImage(cellIndex);
  };
  
  // Render a cell
  const renderCell = (cell, index) => {
    const isSelected = index === selectedCellIndex;
    const isDragOver = index === dragOverCell;
    
    // Find image for this cell
    const cellImage = cell.imageId ? images.find(img => img.id === cell.imageId) : null;
    
    // Calculate position
    const row = Math.floor(index / gridDimensions.cols);
    const col = index % gridDimensions.cols;
    
    const x = col * (cellSize.width + spacing.horizontal);
    const y = row * (cellSize.height + spacing.vertical);
    
    return (
      <div
        key={index}
        className={`
          absolute transition-all duration-150
          ${isSelected ? 'ring-2 ring-pink-500' : ''}
          ${isDragOver ? 'ring-2 ring-pink-300 bg-pink-50' : ''}
        `}
        style={{
          left: x + 'px',
          top: y + 'px',
          width: cellSize.width + 'px',
          height: cellSize.height + 'px',
          cursor: 'pointer',
          backgroundColor: cellImage ? '#fdf2f8' : '#f9fafb', // Light pink or gray
          border: '1px solid #f9a8d4',
          borderRadius: '8px',
          boxShadow: isSelected ? '0 0 0 2px rgba(236, 72, 153, 0.5)' : 'none',
        }}
        onClick={() => handleCellClick(index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, index)}
      >
        {/* Cell content */}
        {cellImage ? (
          <div className="relative w-full h-full p-2 flex items-center justify-center">
            <img 
              src={cellImage.src} 
              alt={cellImage.filename}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Remove button */}
            <button
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-70 hover:opacity-100"
              onClick={(e) => handleRemoveImage(e, index)}
            >
              ×
            </button>
            
            {/* Cell label */}
            <div className="absolute bottom-1 left-1 bg-pink-100 text-pink-800 text-xs px-1 rounded">
              {`R${row + 1}:C${col + 1}`}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <div className="text-pink-300 mb-2">
              {isDragOver ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="text-xs text-pink-400 text-center">
              {isDragOver ? 'Drop image here' : 'Empty cell'}
            </div>
            
            {/* Cell label */}
            <div className="absolute bottom-1 left-1 bg-pink-100 text-pink-800 text-xs px-1 rounded">
              {`R${row + 1}:C${col + 1}`}
            </div>
          </div>
        )}
      </div>
    );
  };
  
return (
   <div className="h-full flex flex-col">
     <div className="flex-1 relative bg-white rounded-lg border border-pink-200 p-4" ref={containerRef}>
       {containerSize.width > 0 && (
         <div className="relative" style={{ 
           width: (cellSize.width + spacing.horizontal) * gridDimensions.cols,
           height: (cellSize.height + spacing.vertical) * gridDimensions.rows
         }}>
           {gridCells.map((cell, index) => renderCell(cell, index))}
         </div>
       )}
       
       {/* Empty state */}
       {containerSize.width === 0 && (
         <div className="absolute inset-0 flex items-center justify-center text-pink-300">
           Loading grid...
         </div>
       )}
       
       {/* Instructions */}
       {gridCells.length > 0 && !gridCells.some(cell => cell.imageId) && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="bg-white/90 p-6 rounded-xl shadow-lg text-center max-w-md">
             <h3 className="text-lg font-semibold text-pink-800 mb-2">Add Images to Grid</h3>
             <p className="text-pink-600">
               Drag and drop images from the left panel onto grid cells, or select an image and then click a cell to place it.
             </p>
           </div>
         </div>
       )}
     </div>
   </div>
 );
};

export default GridDisplay;