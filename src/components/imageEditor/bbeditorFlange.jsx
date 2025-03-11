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
      setBbox({
        x: image.bbLeftOffset,
        y: image.bbTopOffset,
        width: image.bbWidth,
        height: image.bbHeight
      });
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
  
  return (
    <div className="border border-gray-200 rounded-md">
      <div className="p-2 bg-gray-100 border-b border-gray-200 font-medium">
        Bounding Box Editor: {image.filename}
      </div>
      
      <div className="p-4">
        <div className="mb-4 text-sm text-gray-600">
          Define the bounding box area. Drag the boxe or handles to adjust.
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
              </Layer>
            </Stage>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoundingBoxEditor;