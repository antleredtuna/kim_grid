import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image, Group, Transformer, Rect } from 'react-konva';
import Button from '../components/common/Button';

const EditableCanvas = ({ 
  gridCells, 
  images, 
  spacing, 
  onUpdateImage,
  onSaveChanges
}) => {
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [imageNodes, setImageNodes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [scale, setScale] = useState(1);
  
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const containerRef = useRef(null);
  
  // Calculate canvas size based on grid cells
  useEffect(() => {
    if (!gridCells || gridCells.length === 0) return;
    
    const filledCells = gridCells.filter(cell => cell.imageId);
    if (filledCells.length === 0) return;
    
    let maxWidth = 0;
    let maxHeight = 0;
    
    filledCells.forEach(cell => {
      const imageObj = images.find(img => img.id === cell.imageId);
      if (!imageObj) return;
      
      const imageWidth = imageObj.width * (cell.scaleX || 1);
      const imageHeight = imageObj.height * (cell.scaleY || 1);
      
      const right = (cell.columnOffset || 0) + imageWidth + (cell.horizontalOffset || 0);
      const bottom = (cell.rowOffset || 0) + imageHeight + (cell.verticalOffset || 0);
      
      maxWidth = Math.max(maxWidth, right);
      maxHeight = Math.max(maxHeight, bottom);
    });
    
    setCanvasSize({ width: maxWidth, height: maxHeight });
    
    // Create image nodes for the canvas
    const nodes = filledCells.map(cell => {
      const imageObj = images.find(img => img.id === cell.imageId);
      if (!imageObj) return null;
      
      return {
        id: cell.id,
        imageId: cell.imageId,
        x: (cell.columnOffset || 0) + (cell.horizontalOffset || 0),
        y: (cell.rowOffset || 0) + (cell.verticalOffset || 0),
        width: imageObj.width * (cell.scaleX || 1),
        height: imageObj.height * (cell.scaleY || 1),
        scaleX: cell.scaleX || 1,
        scaleY: cell.scaleY || 1,
        src: imageObj.src,
        originalCell: { ...cell },
        originalImage: imageObj
      };
    }).filter(Boolean);
    
    setImageNodes(nodes);
  }, [gridCells, images]);
  
  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && canvasSize.width > 0) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = Math.min(1, containerWidth / canvasSize.width);
        setScale(newScale);
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [canvasSize]);
  
  // Update transformer when selection changes
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      // Find the selected node
      const selectedNode = stageRef.current.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);
  
  // Handle node selection
  const handleSelect = (id) => {
    setSelectedId(id === selectedId ? null : id);
  };
  
  // Handle transform end
  const handleTransformEnd = (node) => {
    const newNodes = imageNodes.map(img => {
      if (img.id === node.id) {
        // Get position from the node
        const { x, y, width, height, scaleX, scaleY } = node.attrs;
        
        // Compute new scales relative to original image
        const originalWidth = img.originalImage.width;
        const originalHeight = img.originalImage.height;
        
        const newScaleX = width / originalWidth;
        const newScaleY = height / originalHeight;
        
        // Update the node with new values
        return {
          ...img,
          x,
          y,
          width,
          height,
          scaleX: newScaleX,
          scaleY: newScaleY
        };
      }
      return img;
    });
    
    setImageNodes(newNodes);
    
    // If callback is provided, call it with the updated node
    if (onUpdateImage) {
      const updatedNode = newNodes.find(n => n.id === node.id);
      if (updatedNode) {
        onUpdateImage(updatedNode);
      }
    }
  };
  
  // Handle manual input change
  const handleInputChange = (e, id, property) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;
    
    const newNodes = imageNodes.map(img => {
      if (img.id === id) {
        const updatedNode = { ...img, [property]: value };
        
        // Update width/height based on scale changes
        if (property === 'scaleX') {
          updatedNode.width = img.originalImage.width * value;
        } else if (property === 'scaleY') {
          updatedNode.height = img.originalImage.height * value;
        }
        
        return updatedNode;
      }
      return img;
    });
    
    setImageNodes(newNodes);
    
    // Update the Konva stage
    if (stageRef.current) {
      const node = stageRef.current.findOne(`#${id}`);
      if (node) {
        if (property === 'x' || property === 'y') {
          node.position({ [property]: value });
        } else if (property === 'scaleX' || property === 'scaleY') {
          const imageObj = newNodes.find(n => n.id === id);
          if (imageObj) {
            node.width(imageObj.width);
            node.height(imageObj.height);
          }
        }
        node.getLayer().batchDraw();
      }
    }
    
    // If callback is provided, call it with the updated node
    if (onUpdateImage) {
      const updatedNode = newNodes.find(n => n.id === id);
      if (updatedNode) {
        onUpdateImage(updatedNode);
      }
    }
  };
  
  // Save all changes
  const handleSaveChanges = () => {
    if (onSaveChanges) {
      onSaveChanges(imageNodes);
    }
  };
  
  // Reset selected node to original state
  const handleResetNode = () => {
    if (!selectedId) return;
    
    const newNodes = imageNodes.map(img => {
      if (img.id === selectedId) {
        const originalCell = img.originalCell;
        const imageObj = img.originalImage;
        
        return {
          ...img,
          x: (originalCell.columnOffset || 0) + (originalCell.horizontalOffset || 0),
          y: (originalCell.rowOffset || 0) + (originalCell.verticalOffset || 0),
          width: imageObj.width * (originalCell.scaleX || 1),
          height: imageObj.height * (originalCell.scaleY || 1),
          scaleX: originalCell.scaleX || 1,
          scaleY: originalCell.scaleY || 1
        };
      }
      return img;
    });
    
    setImageNodes(newNodes);
    
    // Update the Konva stage
    if (stageRef.current) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        const imageObj = newNodes.find(n => n.id === selectedId);
        if (imageObj) {
          node.position({ x: imageObj.x, y: imageObj.y });
          node.width(imageObj.width);
          node.height(imageObj.height);
        }
        node.getLayer().batchDraw();
      }
    }
  };
  
  if (canvasSize.width === 0 || imageNodes.length === 0) {
    return (
      <div className="border border-pink-200 rounded-lg shadow-sm p-6 bg-pink-50 text-center">
        <p className="text-pink-500">Please align images first to enable the canvas editor</p>
      </div>
    );
  }
  
  // Find the selected node data
  const selectedNode = imageNodes.find(node => node.id === selectedId);
  
  return (
    <div className="border border-pink-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-3 bg-pink-100 border-b border-pink-200 font-medium flex items-center justify-between text-pink-800">
        <div>Interactive Canvas Editor</div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSaveChanges} variant="primary">Save Changes</Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Canvas container */}
        <div 
          ref={containerRef} 
          className="flex-1 bg-white border-r border-pink-100 p-4 overflow-auto"
          style={{ height: '500px' }}
        >
          <Stage
            ref={stageRef}
            width={canvasSize.width * scale}
            height={canvasSize.height * scale}
            scale={{ x: scale, y: scale }}
          >
            <Layer>
              {/* White background */}
              <Rect
                x={0}
                y={0}
                width={canvasSize.width}
                height={canvasSize.height}
                fill="white"
              />
              
              {/* Images */}
              {imageNodes.map((node) => {
                // Create an image object that will load the src
                const imageElement = new window.Image();
                imageElement.src = node.src;
                
                return (
                  <Group key={node.id}>
                    <Image
                      id={node.id}
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      image={imageElement}
                      onClick={() => handleSelect(node.id)}
                      onTap={() => handleSelect(node.id)}
                      onTransformEnd={(e) => handleTransformEnd(e.target)}
                      onDragEnd={(e) => handleTransformEnd(e.target)}
                      draggable
                    />
                  </Group>
                );
              })}
              
              {/* Transformer for selected image */}
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Minimum size constraints
                  if (newBox.width < 10 || newBox.height < 10) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>
        </div>
        
        {/* Controls sidebar */}
        <div className="w-full md:w-80 p-4 bg-pink-50">
          <div className="mb-4">
            <h3 className="font-medium text-pink-800 mb-2">Canvas Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white p-2 rounded border border-pink-100">
                <span className="text-pink-500">Width:</span> {Math.round(canvasSize.width)}px
              </div>
              <div className="bg-white p-2 rounded border border-pink-100">
                <span className="text-pink-500">Height:</span> {Math.round(canvasSize.height)}px
              </div>
              <div className="bg-white p-2 rounded border border-pink-100">
                <span className="text-pink-500">Images:</span> {imageNodes.length}
              </div>
              <div className="bg-white p-2 rounded border border-pink-100">
                <span className="text-pink-500">Scale:</span> {Math.round(scale * 100)}%
              </div>
            </div>
          </div>
          
          {selectedNode ? (
            <div className="bg-white p-4 rounded-lg border border-pink-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-pink-800">Selected Image Properties</h3>
                <Button 
                  onClick={handleResetNode} 
                  variant="secondary" 
                  className="text-xs px-2 py-1"
                >
                  Reset
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-pink-700 mb-1">
                    X Position
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedNode.x)}
                    onChange={(e) => handleInputChange(e, selectedId, 'x')}
                    className="w-full px-2 py-1 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-pink-700 mb-1">
                    Y Position
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedNode.y)}
                    onChange={(e) => handleInputChange(e, selectedId, 'y')}
                    className="w-full px-2 py-1 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-pink-700 mb-1">
                    Width
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedNode.width)}
                    onChange={(e) => handleInputChange(e, selectedId, 'width')}
                    className="w-full px-2 py-1 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-pink-700 mb-1">
                    Height
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedNode.height)}
                    onChange={(e) => handleInputChange(e, selectedId, 'height')}
                    className="w-full px-2 py-1 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-pink-700 mb-1">
                    Scale X
                  </label>
                  <input
                    type="number"
                    value={selectedNode.scaleX.toFixed(2)}
                    step="0.1"
                    onChange={(e) => handleInputChange(e, selectedId, 'scaleX')}
                    className="w-full px-2 py-1 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-pink-700 mb-1">
                    Scale Y
                  </label>
                  <input
                    type="number"
                    value={selectedNode.scaleY.toFixed(2)}
                    step="0.1"
                    onChange={(e) => handleInputChange(e, selectedId, 'scaleY')}
                    className="w-full px-2 py-1 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>
              
              <div className="mt-4 bg-pink-50 p-2 rounded text-xs text-pink-600">
                <p>
                  <strong>Tip:</strong> You can drag the image or use the transform 
                  handles to resize. Changes will update the values above.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border border-pink-200 text-center">
              <p className="text-pink-500">Click on an image to edit its properties</p>
            </div>
          )}
          
          <div className="mt-4 text-xs text-pink-600 bg-pink-100 p-3 rounded">
            <h4 className="font-medium mb-1">Instructions:</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>Click on an image to select it</li>
              <li>Drag to move the selected image</li>
              <li>Use the handles to resize</li>
              <li>Edit values directly in the form</li>
              <li>Click "Save Changes" when done</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditableCanvas;