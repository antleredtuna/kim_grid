import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for file operations like drag-and-drop and clipboard
 */
export function useFileOperations({ onFiles }) {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFiles = useCallback((files) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length > 0) {
      onFiles(imageFiles);
    }
  }, [onFiles]);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handlePaste = useCallback((e) => {
    const clipboardItems = e.clipboardData.items;
    const imageItems = Array.from(clipboardItems).filter(item => 
      item.type.indexOf('image') !== -1
    );
    
    if (imageItems.length > 0) {
      const files = imageItems.map(item => item.getAsFile());
      handleFiles(files);
    }
  }, [handleFiles]);
  
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);
  
  return {
    isDragging,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFiles
  };
}
