import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Group } from 'react-konva';

const BoundingBoxEditor = ({ image, onUpdate }) => {
  const [stageSize, setStageSize] = useState({ width: 0, height: 0, scale: 1 });
  const [bbox, setBbox] = useState({
    x: 0, 
    y: 0, 
    width: 0, 
    height: 0
  });
  const [activeHandle, setActiveHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalBbox, setOriginalBbox] = useState(null);
  
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  
  // Initialize bbox state when image changes
  useEffect(() => {
    if (image) {
      // Ensure we have valid bbox data
      if (image.bbLeftOffset !== undefined && 
          image.bbTopOffset !== undefined &&
          image.bbWidth !== undefined && 
          image.bbHeight !== undefined) {
        setBbox({
          x: image.bbLeftOffset,
          y: image.bbTopOffset,
          width: image.bbWidth,
          height: image.bbHeight
        });
      } else {
        // Fallback to default values
        setBbox({
          x: Math.round(image.width * 0.1),
          y: Math.round(image.height * 0.1),
          width: Math.round(image.width * 0.8),
          height: Math.round(image.height * 0.8)
        });
      }
    }
  }, [image]);
  
  
  // Adjust stage size based on container and image
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current || !image) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      
      const imageAspect = image.width / image.height;
      const maxHeight = 500; // max height for the stage
      
      let stageWidth = containerWidth;
      let stageHeight = stageWidth / imageAspect;
      
      if (stageHeight > maxHeight) {
        stageHeight = maxHeight;
        stageWidth = stageHeight * imageAspect;
      }
      
      setStageSize({
        width: stageWidth,
        height: stageHeight,
        scale: stageWidth / image.width
      });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, [image]);
  
  // Main box drag
  const handleBoxDragStart = (e) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    const position = {
      x: (pointerPos.x / stageSize.scale),
      y: (pointerPos.y / stageSize.scale)
    };
    
    // Check if this is inside the bounding box
    if (
      position.x >= bbox.x &&
      position.x <= bbox.x + bbox.width &&
      position.y >= bbox.y &&
      position.y <= bbox.y + bbox.height
    ) {
      setActiveHandle('box');
      setDragStart(position);
      setOriginalBbox({...bbox});
    }
    
    // Check if we're on a handle
    const handleSize = 8 / stageSize.scale;
    const halfHandleSize = handleSize / 2;
    
    // Corner handles
    if (Math.abs(position.x - bbox.x) <= halfHandleSize && 
        Math.abs(position.y - bbox.y) <= halfHandleSize) {
      setActiveHandle('topLeft');
      setDragStart(position);
      setOriginalBbox({...bbox});
      return;
    }
    
    if (Math.abs(position.x - (bbox.x + bbox.width)) <= halfHandleSize && 
        Math.abs(position.y - bbox.y) <= halfHandleSize) {
      setActiveHandle('topRight');
      setDragStart(position);
      setOriginalBbox({...bbox});
      return;
    }
    
    if (Math.abs(position.x - bbox.x) <= halfHandleSize && 
        Math.abs(position.y - (bbox.y + bbox.height)) <= halfHandleSize) {
      setActiveHandle('bottomLeft');
      setDragStart(position);
      setOriginalBbox({...bbox});
      return;
    }
    
    if (Math.abs(position.x - (bbox.x + bbox.width)) <= halfHandleSize && 
        Math.abs(position.y - (bbox.y + bbox.height)) <= halfHandleSize) {
      setActiveHandle('bottomRight');
      setDragStart(position);
      setOriginalBbox({...bbox});
      return;
    }
    
    // Edge handles
    if (Math.abs(position.x - bbox.x) <= halfHandleSize && 
        Math.abs(position.y - (bbox.y + bbox.height/2)) <= halfHandleSize) {
      setActiveHandle('left');
      setDragStart(position);
      setOriginalBbox({...bbox});
      return;
    }
    
    if (Math.abs(position.x - (bbox.x + bbox.width)) <= halfHandleSize && 
        Math.abs(position.y - (bbox.y + bbox.height/2)) <= halfHandleSize) {
      setActiveHandle('right');
      setDragStart(position);
      setOriginalBbox({...bbox});
      return;
    }
    
    if (Math.abs(position.x - (bbox.x + bbox.width/2)) <= halfHandleSize && 
        Math.abs(position.y - bbox.y) <= halfHandleSize) {
      setActiveHandle('top');
      setDragStart(position);
      setOriginalBbox({...bbox});
      return;
    }
    
    if (Math.abs(position.x - (bbox.x + bbox.width/2)) <= halfHandleSize && 
        Math.abs(position.y - (bbox.y + bbox.height)) <= halfHandleSize) {
      setActiveHandle('bottom');
      setDragStart(position);
      setOriginalBbox({...bbox});
      return;
    }
  };
  
  const handleBoxDragMove = (e) => {
    if (!activeHandle || !originalBbox) return;
    
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    const position = {
      x: (pointerPos.x / stageSize.scale),
      y: (pointerPos.y / stageSize.scale)
    };
    
    // Calculate drag delta
    const deltaX = position.x - dragStart.x;
    const deltaY = position.y - dragStart.y;
    
    let newBbox = {...bbox};
    
    switch (activeHandle) {
      case 'box':
        newBbox = {
          ...originalBbox,
          x: originalBbox.x + deltaX,
          y: originalBbox.y + deltaY
        };
        break;
      case 'topLeft':
        newBbox = {
          x: originalBbox.x + deltaX,
          y: originalBbox.y + deltaY,
          width: originalBbox.width - deltaX,
          height: originalBbox.height - deltaY
        };
        break;
      case 'topRight':
        newBbox = {
          x: originalBbox.x,
          y: originalBbox.y + deltaY,
          width: originalBbox.width + deltaX,
          height: originalBbox.height - deltaY
        };
        break;
      case 'bottomLeft':
        newBbox = {
          x: originalBbox.x + deltaX,
          y: originalBbox.y,
          width: originalBbox.width - deltaX,
          height: originalBbox.height + deltaY
        };
        break;
      case 'bottomRight':
        newBbox = {
          x: originalBbox.x,
          y: originalBbox.y,
          width: originalBbox.width + deltaX,
          height: originalBbox.height + deltaY
        };
        break;
      case 'left':
        newBbox = {
          x: originalBbox.x + deltaX,
          y: originalBbox.y,
          width: originalBbox.width - deltaX,
          height: originalBbox.height
        };
        break;
      case 'right':
        newBbox = {
          x: originalBbox.x,
          y: originalBbox.y,
          width: originalBbox.width + deltaX,
          height: originalBbox.height
        };
        break;
      case 'top':
        newBbox = {
          x: originalBbox.x,
          y: originalBbox.y + deltaY,
          width: originalBbox.width,
          height: originalBbox.height - deltaY
        };
        break;
      case 'bottom':
        newBbox = {
          x: originalBbox.x,
          y: originalBbox.y,
          width: originalBbox.width,
          height: originalBbox.height + deltaY
        };
        break;
      default:
        break;
    }
    
    // Basic constraints to prevent negative dimensions during drag
    if (newBbox.width < 10) {
      if (activeHandle === 'topLeft' || activeHandle === 'bottomLeft' || activeHandle === 'left') {
        newBbox.x = originalBbox.x + originalBbox.width - 10;
        newBbox.width = 10;
      } else {
        newBbox.width = 10;
      }
    }
    
    if (newBbox.height < 10) {
      if (activeHandle === 'topLeft' || activeHandle === 'topRight' || activeHandle === 'top') {
        newBbox.y = originalBbox.y + originalBbox.height - 10;
        newBbox.height = 10;
      } else {
        newBbox.height = 10;
      }
    }
    
    // Temporary update during drag - don't apply all constraints yet
    setBbox(newBbox);
  };
  
  const handleBoxDragEnd = (e) => {
    if (!activeHandle) return;
    
    // Apply final constraints
    let finalBbox = {...bbox};
    
    // Make sure box is within image bounds
    if (finalBbox.x < 0) finalBbox.x = 0;
    if (finalBbox.y < 0) finalBbox.y = 0;
    if (finalBbox.x + finalBbox.width > image.width) {
      if (activeHandle === 'topLeft' || activeHandle === 'bottomLeft' || activeHandle === 'left') {
        finalBbox.x = image.width - finalBbox.width;
      } else {
        finalBbox.width = image.width - finalBbox.x;
      }
    }
    if (finalBbox.y + finalBbox.height > image.height) {
      if (activeHandle === 'topLeft' || activeHandle === 'topRight' || activeHandle === 'top') {
        finalBbox.y = image.height - finalBbox.height;
      } else {
        finalBbox.height = image.height - finalBbox.y;
      }
    }
    
    // Ensure minimum dimensions
    if (finalBbox.width < 10) finalBbox.width = 10;
    if (finalBbox.height < 10) finalBbox.height = 10;
    
    setBbox(finalBbox);
    
    // Update parent component
    onUpdate({
      bbLeftOffset: finalBbox.x,
      bbTopOffset: finalBbox.y,
      bbWidth: finalBbox.width,
      bbHeight: finalBbox.height
    });
    
    // Reset drag state
    setActiveHandle(null);
    setDragStart({ x: 0, y: 0 });
    setOriginalBbox(null);
  };
  
  // Handle numeric input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    if (isNaN(numValue)) return;
    
    const updatedBbox = { ...bbox };
    updatedBbox[name] = numValue;
    
    // Apply constraints
    if (updatedBbox.x < 0) updatedBbox.x = 0;
    if (updatedBbox.y < 0) updatedBbox.y = 0;
    if (updatedBbox.width < 10) updatedBbox.width = 10;
    if (updatedBbox.height < 10) updatedBbox.height = 10;
    if (updatedBbox.x + updatedBbox.width > image.width) {
      if (name === 'x') {
        updatedBbox.x = image.width - updatedBbox.width;
      } else {
        updatedBbox.width = image.width - updatedBbox.x;
      }
    }
    if (updatedBbox.y + updatedBbox.height > image.height) {
      if (name === 'y') {
        updatedBbox.y = image.height - updatedBbox.height;
      } else {
        updatedBbox.height = image.height - updatedBbox.y;
      }
    }
    
    setBbox(updatedBbox);
    
    // Update parent component
    onUpdate({
      bbLeftOffset: updatedBbox.x,
      bbTopOffset: updatedBbox.y,
      bbWidth: updatedBbox.width,
      bbHeight: updatedBbox.height
    });
  };
  
  if (!image) {
    return <div className="text-center p-4">No image selected</div>;
  }
  
  return (
    <div className="border border-gray-200 rounded-md">
      <div className="p-2 bg-gray-100 border-b border-gray-200 font-medium">
        Bounding Box Editor: {image.filename}
      </div>
      
      <div className="p-4">
        <div className="mb-4 text-sm text-gray-600">
          Define the bounding box area. Drag the boxes or their handles to adjust.
        </div>
        
        <div 
          ref={containerRef} 
          className="border border-gray-300 rounded-md mb-4"
        >
          {stageSize.width > 0 && (
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              scaleX={stageSize.scale}
              scaleY={stageSize.scale}
              onMouseDown={handleBoxDragStart}
              onMouseMove={handleBoxDragMove}
              onMouseUp={handleBoxDragEnd}
              onMouseLeave={handleBoxDragEnd}
            >
              <Layer>
                {/* Background Image */}
                {image.image && (
                  <KonvaImage
                    image={image.image}
                    width={image.width}
                    height={image.height}
                  />
                )}

                {/* Bounding Box */}
                <Rect
                  x={bbox.x}
                  y={bbox.y}
                  width={bbox.width}
                  height={bbox.height}
                  stroke="#ff5722"
                  strokeWidth={2 / stageSize.scale}
                  dash={[5 / stageSize.scale, 5 / stageSize.scale]}
                />
                
                {/* Handles */}
                {activeHandle !== 'box' && (
                  <>
                    {/* Top-left corner */}
                    <Rect
                      x={bbox.x - 4 / stageSize.scale}
                      y={bbox.y - 4 / stageSize.scale}
                      width={8 / stageSize.scale}
                      height={8 / stageSize.scale}
                      fill="#ff5722"
                      stroke="white"
                      strokeWidth={1 / stageSize.scale}
                    />
                    
                    {/* Top-right corner */}
                    <Rect
                      x={bbox.x + bbox.width - 4 / stageSize.scale}
                      y={bbox.y - 4 / stageSize.scale}
                      width={8 / stageSize.scale}
                      height={8 / stageSize.scale}
                      fill="#ff5722"
                      stroke="white"
                      strokeWidth={1 / stageSize.scale}
                    />
                    
                    {/* Bottom-left corner */}
                    <Rect
                      x={bbox.x - 4 / stageSize.scale}
                      y={bbox.y + bbox.height - 4 / stageSize.scale}
                      width={8 / stageSize.scale}
                      height={8 / stageSize.scale}
                      fill="#ff5722"
                      stroke="white"
                      strokeWidth={1 / stageSize.scale}
                    />
                    
                    {/* Bottom-right corner */}
                    <Rect
                      x={bbox.x + bbox.width - 4 / stageSize.scale}
                      y={bbox.y + bbox.height - 4 / stageSize.scale}
                      width={8 / stageSize.scale}
                      height={8 / stageSize.scale}
                      fill="#ff5722"
                      stroke="white"
                      strokeWidth={1 / stageSize.scale}
                    />
                    
                    {/* Left edge */}
                    <Rect
                      x={bbox.x - 4 / stageSize.scale}
                      y={bbox.y + bbox.height/2 - 4 / stageSize.scale}
                      width={8 / stageSize.scale}
                      height={8 / stageSize.scale}
                      fill="#ff5722"
                      stroke="white"
                      strokeWidth={1 / stageSize.scale}
                    />
                    
                    {/* Right edge */}
                    <Rect
                      x={bbox.x + bbox.width - 4 / stageSize.scale}
                      y={bbox.y + bbox.height/2 - 4 / stageSize.scale}
                      width={8 / stageSize.scale}
                      height={8 / stageSize.scale}
                      fill="#ff5722"
                      stroke="white"
                      strokeWidth={1 / stageSize.scale}
                    />
                    
                    {/* Top edge */}
                    <Rect
                      x={bbox.x + bbox.width/2 - 4 / stageSize.scale}
                      y={bbox.y - 4 / stageSize.scale}
                      width={8 / stageSize.scale}
                      height={8 / stageSize.scale}
                      fill="#ff5722"
                      stroke="white"
                      strokeWidth={1 / stageSize.scale}
                    />
                    
                    {/* Bottom edge */}
                    <Rect
                      x={bbox.x + bbox.width/2 - 4 / stageSize.scale}
                      y={bbox.y + bbox.height - 4 / stageSize.scale}
                      width={8 / stageSize.scale}
                      height={8 / stageSize.scale}
                      fill="#ff5722"
                      stroke="white"
                      strokeWidth={1 / stageSize.scale}
                    />
                  </>
                )}
              </Layer>
            </Stage>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Left Offset (X)</label>
            <input
              type="number"
              name="x"
              value={Math.round(bbox.x)}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Top Offset (Y)</label>
            <input
              type="number"
              name="y"
              value={Math.round(bbox.y)}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
            <input
              type="number"
              name="width"
              value={Math.round(bbox.width)}
              onChange={handleInputChange}
              min="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
            <input
              type="number"
              name="height"
              value={Math.round(bbox.height)}
              onChange={handleInputChange}
              min="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoundingBoxEditor;
