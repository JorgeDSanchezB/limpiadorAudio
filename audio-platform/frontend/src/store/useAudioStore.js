import { create } from 'zustand';
import { apiClient } from '../api/client';

export const useAudioStore = create((set) => ({
  files: [],
  isLoading: false,
  isUploading: false,
  error: null,
  fetchFiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get('/audio/files');
      set({ files: res.data });
    } catch {
      set({ error: 'No se pudo conectar con el servicio local. Abre la aplicación de escritorio de nuevo.' });
    } finally {
      set({ isLoading: false });
    }
  },
  uploadFile: async (file, onProgress) => {
    set({ isUploading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/audio/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 70));
        },
      });
      set((state) => ({ files: [response.data, ...state.files] }));
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'No se pudo procesar el audio.' });
      throw error;
    } finally {
      set({ isUploading: false });
    }
  },
  deleteFile: async (jobId) => {
    try {
      await apiClient.delete(`/audio/files/${jobId}`);
      set((state) => ({ files: state.files.filter((f) => f.id !== jobId) }));
    } catch (error) {
      set({ error: error.response?.data?.detail || 'No se pudo borrar el audio.' });
    }
  },
  clearFiles: async () => {
    try {
      await apiClient.delete('/audio/files');
      set({ files: [] });
    } catch (error) {
      set({ error: error.response?.data?.detail || 'No se pudo vaciar el historial.' });
    }
  },
}));
