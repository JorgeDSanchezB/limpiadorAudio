import { create } from 'zustand';
import { apiClient } from '../api/client';

export const useAudioStore = create((set, get) => ({
  files: [],
  nextCursor: null,
  isLoading: false,
  isUploading: false,

  fetchFiles: async (limit = 10) => {
    set({ isLoading: true });
    try {
      const cursor = get().nextCursor;
      const res = await apiClient.get('/audio/files', { params: { limit, cursor } });
      set({
        files: [...get().files, ...res.data.items],
        nextCursor: res.data.next_cursor,
      });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  uploadFile: async (file) => {
    set({ isUploading: true });
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await apiClient.post('/audio/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      set({ isUploading: false });
    }
  },
}));
