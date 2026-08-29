import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { useAudioStore } from '../../store/useAudioStore';
import { downloadAudio } from '../../utils/download';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

const EqIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-amber">
    <rect x="4" y="8" width="3" height="8" rx="1" fill="currentColor" opacity="0.55" />
    <rect x="10.5" y="4" width="3" height="16" rx="1" fill="currentColor" />
    <rect x="17" y="11" width="3" height="2" rx="1" fill="currentColor" opacity="0.55" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const FileListItem = React.memo(({ file, style }) => {
  const deleteFile = useAudioStore((s) => s.deleteFile);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const audioUrl = `${apiClient.defaults.baseURL}${file.download_url}`;

  const handleDelete = async () => {
    if (window.confirm(`¿Borrar el audio limpio «${file.original_filename}»?`)) {
      await deleteFile(file.id);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError('');
    try {
      await downloadAudio(audioUrl);
    } catch (err) {
      setDownloadError(
        typeof err === 'string' ? err : err?.message || 'No se pudo descargar el audio.',
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={style} className="px-1 py-2">
      <div className="rounded-lg border border-ink-line bg-ink-panel p-3 transition-colors hover:border-amber/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <EqIcon />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold uppercase tracking-[0.1em] text-paper">
                {file.original_filename}
              </p>
              <Badge tone="signal">Limpio · {(file.size_bytes / 1024 / 1024).toFixed(1)} MB</Badge>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              aria-label={`Borrar ${file.original_filename}`}
              title="Borrar este audio"
              className="rounded-md border border-ink-line bg-ink-panel p-2 text-paper-dim transition-colors hover:border-danger/60 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              <TrashIcon />
            </button>
            <Button onClick={handleDownload} variant="ghost" size="sm" disabled={downloading}>
              {downloading ? 'Guardando…' : 'Descargar'}
            </Button>
          </div>
        </div>
        {downloadError && (
          <p role="alert" className="mt-2 font-mono text-xs text-danger">
            {downloadError}
          </p>
        )}
        <audio className="mt-3 w-full" controls preload="none" src={audioUrl} />
      </div>
    </div>
  );
});
