import { useState, useRef } from 'react';
import { FixedSizeList as VirtualList } from 'react-window';
import { useAudioStore } from '../../store/useAudioStore';
import { ProgressBar } from '../atoms/ProgressBar';
import { FileListItem } from '../molecules/FileListItem';

export const AudioProcessorView = () => {
  const { files, fetchFiles, uploadFile, isLoading, isUploading } = useAudioStore();
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 200);
    await uploadFile(file);
    clearInterval(interval);
    setProgress(100);
    setTimeout(() => setProgress(0), 1000);
    await fetchFiles();
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Audio Processor</h1>

      <div className="mb-6">
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={isUploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400"
        >
          {isUploading ? 'Procesando...' : 'Subir Audio'}
        </button>
        {progress > 0 && (
          <div className="mt-2">
            <ProgressBar progress={progress} />
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <h2 className="text-lg font-semibold p-4 bg-gray-50 border-b">Archivos</h2>

        {files.length === 0 ? (
          <p className="p-4 text-gray-500 text-sm">No hay archivos.</p>
        ) : (
          <VirtualList
            height={400}
            itemCount={files.length}
            itemSize={60}
            width="100%"
            itemData={files}
          >
            {({ index, style, data }) => (
              <FileListItem file={data[index]} style={style} />
            )}
          </VirtualList>
        )}

        <button
          onClick={() => fetchFiles()}
          disabled={isLoading}
          className="w-full p-3 text-sm text-blue-600 hover:bg-blue-50 transition border-t"
        >
          {isLoading ? 'Cargando...' : 'Cargar mas'}
        </button>
      </div>
    </div>
  );
};
