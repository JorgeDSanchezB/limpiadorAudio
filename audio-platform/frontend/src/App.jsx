import { useEffect } from 'react';
import { useAudioStore } from './store/useAudioStore';
import { AudioProcessorView } from './components/organisms/AudioProcessorView';

function App() {
  const fetchFiles = useAudioStore((s) => s.fetchFiles);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="min-h-screen">
      <AudioProcessorView />
    </div>
  );
}

export default App;
