import api from './axiosInstance';

export type UploadFolder = 'products' | 'categories';

/**
 * Upload Service
 * POST /uploads/images (administrateur) : envoie une image et renvoie son URL publique
 */
export const uploadService = {
  uploadImage: async (file: File, folder: UploadFolder = 'products'): Promise<string> => {
    const body = new FormData();
    body.append('file', file);
    const response = await api.post<{ url: string }>('/uploads/images', body, {
      params: { folder },
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    return response.data.url;
  },
};

export default uploadService;
