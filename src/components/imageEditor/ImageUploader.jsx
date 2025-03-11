import React, { useRef } from 'react';
import Button from '../common/Button';

const ImageUploader = ({ 
  onProcess, 
  onClear, 
  isDragging, 
  onDrop, 
  onDragOver, 
  onDragLeave 
}) => {
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      onProcess(e.target.files);
    }
  };
  
  return (
    <div className="space-y-4">
      <div
        className={`drop-zone border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${ 
          isDragging 
            ? 'border-pink-500 bg-pink-50 shadow-lg transform scale-[1.02]' 
            : 'border-pink-300 hover:border-pink-400'
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current.click()}
      >
        {/* Content will go here */}
      </div>
      
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-pink-600 flex items-center">
          <span className="italic">Paste from clipboard with Ctrl+V / Cmd+V</span>
        </div>
        <Button onClick={onClear} variant="danger">
          Clear All Images
        </Button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;
