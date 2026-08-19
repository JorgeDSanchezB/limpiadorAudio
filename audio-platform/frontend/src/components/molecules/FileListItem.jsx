import React from 'react';

export const FileListItem = React.memo(({ file, style }) => (
  <div
    style={style}
    className="flex items-center justify-between border-b border-gray-100 px-4 py-2 hover:bg-gray-50"
  >
    <div className="flex-1 truncate text-sm font-medium text-gray-800">
      🎵 {file.original_filename}
    </div>
    <div className="text-xs text-gray-500 ml-4">
      {(file.size_bytes / 1024).toFixed(1)} KB
    </div>
  </div>
));
