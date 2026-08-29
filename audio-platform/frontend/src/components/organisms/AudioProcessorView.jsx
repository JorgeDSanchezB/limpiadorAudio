import { useRef, useState } from 'react';
import { FixedSizeList as VirtualList } from 'react-window';
import { useAudioStore } from '../../store/useAudioStore';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Waveform } from '../atoms/Waveform';
import { ProgressBar } from '../atoms/ProgressBar';
import { FileListItem } from '../molecules/FileListItem';

export const AudioProcessorView = () => {
  const { files, uploadFile, isLoading, isUploading, error, clearFiles } = useAudioStore();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const waveMode = isUploading ? 'processing' : done ? 'clean' : 'idle';

  const handleClearAll = async () => {
    if (window.confirm('¿Vaciar todo el historial? Se borrarán todos los audios limpios y sus archivos.')) {
      await clearFiles();
      setDone(false);
      setMessage('');
    }
  };

  const runUpload = async (file) => {
    if (!file) return;
    setDone(false);
    setMessage('Subiendo tu audio…');
    setProgress(1);
    try {
      await uploadFile(file, setProgress);
      setProgress(100);
      setDone(true);
      setMessage('Tu audio quedó limpio. Escúchalo o descárgalo abajo.');
    } catch {
      setProgress(0);
      setDone(false);
      setMessage('');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onPick = (event) => runUpload(event.target.files?.[0]);
  const onDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    runUpload(event.dataTransfer.files?.[0]);
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 font-body">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold uppercase tracking-[0.18em] text-paper">
          Limpiador de audio
        </h1>
        <Badge tone="amber">100% local</Badge>
      </header>
      <p className="mt-2 max-w-md text-sm text-paper-dim">
        Reduce el ruido de fondo de tus grabaciones y deja tu voz lista para el podcast. Tu audio
        nunca sale de este equipo.
      </p>

      <section
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={`mt-8 rounded-xl border bg-ink-panel p-6 transition-colors ${
          dragActive ? 'border-amber' : 'border-ink-line'
        }`}
      >
        <input
          type="file"
          accept=".wav,.mp3,.m4a,.aac,.flac,.ogg,audio/*"
          ref={fileInputRef}
          onChange={onPick}
          className="sr-only"
        />
        <Waveform
          mode={waveMode}
          height={88}
          label="Señal de audio: en reposo, procesando o limpia"
        />
        <div className="mt-5 text-center">
          <p className="font-display text-lg font-semibold uppercase tracking-[0.12em] text-paper">
            {isUploading ? 'Limpiando tu audio…' : 'Elige tu audio para limpiarlo'}
          </p>
          <p className="mt-1 font-mono text-xs text-paper-dim">
            WAV · MP3 · M4A · AAC · FLAC · OGG — hasta 500 MB
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-4"
          >
            {isUploading ? 'Procesando…' : 'Elegir audio'}
          </Button>
        </div>
        {isUploading && (
          <div className="mt-4">
            <ProgressBar progress={progress} />
            <p className="mt-1.5 font-mono text-xs text-paper-dim">
              {progress < 70 ? 'Subiendo…' : 'Limpiando en este equipo…'}
            </p>
          </div>
        )}
        {message && !isUploading && (
          <p className="mt-4 rounded border border-signal/40 bg-signal/10 px-3 py-2 font-mono text-xs text-signal">
            {message}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mt-4 rounded border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-xs text-danger"
          >
            {error}
          </p>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-paper-dim">
              Audios limpios
            </h2>
            {files.length > 0 && (
              <Badge tone="signal">
                {files.length} listo{files.length === 1 ? '' : 's'}
              </Badge>
            )}
          </div>
          {files.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleClearAll}>
              Vaciar historial
            </Button>
          )}
        </div>
        {isLoading ? (
          <p className="font-mono text-xs text-paper-dim">Conectando con el servicio local…</p>
        ) : files.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink-line px-4 py-8 text-center">
            <p className="text-sm text-paper-dim">Aún no hay audios limpios.</p>
            <p className="mt-1 font-mono text-xs text-paper-dim">
              Elige el primero arriba y lo verás aquí con su reproductor.
            </p>
          </div>
        ) : (
          <VirtualList
            height={Math.min(files.length * 128, 512)}
            itemCount={files.length}
            itemSize={128}
            width="100%"
            itemData={files}
          >
            {({ index, style, data }) => <FileListItem file={data[index]} style={style} />}
          </VirtualList>
        )}
      </section>
    </main>
  );
};
