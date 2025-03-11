import React, { useState } from 'react';

const AlignmentLog = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border border-pink-200 rounded-lg shadow-sm mb-4 overflow-hidden">
      <div 
        className="p-3 bg-pink-100 border-b border-pink-200 font-medium flex justify-between items-center cursor-pointer transition-colors hover:bg-pink-200"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center text-pink-800">
          Alignment Log <span className="ml-2 bg-pink-500 text-white rounded-full px-2 py-0.5 text-xs">{log.length}</span>
        </div>
        <div className="flex items-center text-pink-600">
          <span className="text-sm mr-1">{expanded ? 'Hide' : 'Show'}</span>
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 max-h-60 overflow-y-auto bg-white">
          {log.length === 0 ? (
            <div className="text-center text-pink-400 py-4">
              No alignment actions performed yet
            </div>
          ) : (
            <div className="space-y-3">
              {log.map((entry, index) => (
                <div key={index} className="p-3 border-l-4 border-pink-300 bg-pink-50 rounded-r">
                  <div className="flex items-center mb-1">
                    <div className="text-xs text-pink-500 font-mono">
                      [{entry.timestamp}]
                    </div>
                    <div className="ml-2 text-pink-800 font-medium text-sm">
                      {entry.message}
                    </div>
                  </div>
                  {entry.data && (
                    <div className="mt-2 relative">
                      <pre className="bg-white p-2 rounded text-xs overflow-x-auto text-pink-700 shadow-inner border border-pink-100">
                        {entry.data}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlignmentLog;
