import { invoke, isTauri } from '@tauri-apps/api/core';

export const AUDIO_FILENAME = 'audio-limpio.mp3';

export async function downloadAudio(url) {
  if (isTauri()) {
    const result = await invoke('download_audio', { url, filename: AUDIO_FILENAME });
    if (result === 'cancelado') return;
    return true;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error('No se pudo descargar el audio.');
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = AUDIO_FILENAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}