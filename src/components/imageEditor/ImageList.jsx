import React, { useRef, useEffect } from 'react';

const ImageList = ({ 
  images, 
  selectedImageId, 
  onSelectImage, 
  showAssignedState = false,
  getAssignedState = () => false,
  allowDragDrop = false
}) => {
  const dragPreviewRef = useRef(null);

  // Create a hidden image element for drag preview
  useEffect(() => {
    if (allowDragDrop && !dragPreviewRef.current) {
      const img = document.createElement('img');
      img.style.position = 'absolute';
      img.style.top = '-9999px';
      img.style.left = '-9999px';
      img.width = 100; // Small fixed size for preview
      img.height = 100;
      document.body.appendChild(img);
      dragPreviewRef.current = img;
    }

    // Cleanup
    return () => {
      if (dragPreviewRef.current && dragPreviewRef.current.parentNode) {
        try {
          dragPreviewRef.current.parentNode.removeChild(dragPreviewRef.current);
        } catch (e) {
          console.log('Error removing drag preview element:', e);
        }
        dragPreviewRef.current = null;
      }
    };
  }, [allowDragDrop]);

  if (images.length === 0) {
    return (
      <div className="border border-pink-200 bg-pink-50 rounded-lg p-6 min-h-40 flex flex-col items-center justify-center text-pink-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-pink-600 text-center font-medium">No images uploaded yet</p>
        <p className="text-pink-400 text-sm text-center mt-1">
          Upload or paste images to get started
        </p>
      </div>
    );
  }

  return (
    <div className="border border-pink-200 rounded-lg">
      <div className="p-3 bg-pink-100 border-b border-pink-200 font-medium text-pink-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Images ({images.length})
      </div>
      <div className="grid grid-cols-2 gap-3 p-3 max-h-80 overflow-y-auto">
        {images.map(image => {
          const isAssigned = showAssignedState && getAssignedState(image.id);
          
          return (
            <div
              key={image.id}
              className={`
                flex flex-col border rounded-lg p-2 cursor-pointer transition-all duration-200
                ${image.id === selectedImageId 
                  ? 'border-pink-500 bg-pink-50 shadow-md transform scale-[1.02]' 
                  : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                }
                ${isAssigned ? 'opacity-60' : ''}
              `}
              onClick={() => onSelectImage(image.id)}
              draggable={allowDragDrop ? "true" : "false"}
              onDragStart={allowDragDrop ? (e) => {
                // Set the data payload
                const data = JSON.stringify({
                  imageId: image.id,
                  type: 'image-drag'
                });
                e.dataTransfer.setData('application/json', data);
                e.dataTransfer.effectAllowed = 'copy';
                
                // Prepare a small preview image
                if (dragPreviewRef.current) {
                  const dragImg = dragPreviewRef.current;
                  dragImg.src = image.src;
                  e.dataTransfer.setDragImage(dragImg, 50, 50);
                }
                
                // Visual feedback for drag
                e.currentTarget.classList.add('opacity-50');
              } : undefined}
              onDragEnd={allowDragDrop ? (e) => {
                // Remove the dragging class
                e.currentTarget.classList.remove('opacity-50');
              } : undefined}
            >
              <div className="w-full h-20 flex items-center justify-center bg-pink-100/50 mb-2 rounded overflow-hidden">
                <img
                  src={image.src}
                  alt={image.filename}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="w-full relative">
                <div className="text-xs truncate font-medium text-pink-800" title={image.filename}>
                  {image.filename}
                </div>
                <div className="text-xs text-pink-500 mt-1 flex justify-between items-center">
                  <span>{image.width}×{image.height}px</span>
                  {isAssigned && (
                    <span className="bg-pink-200 text-pink-800 px-1 rounded text-xs">In Grid</span>
                  )}
                </div>
              </div>
              {image.id === selectedImageId && (
                <div className="absolute top-0 right-0 bg-pink-500 text-white rounded-full p-1 -mt-2 -mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageList;
