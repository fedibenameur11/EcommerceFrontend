import axios from 'axios';
import api from '@/services/api/axiosInstance';

/**
 * Avec responseType « blob », même un message d'erreur JSON de l'API arrive sous forme de Blob :
 * on le relit pour que getErrorMessage affiche le vrai motif (404, 403, commande annulée...).
 */
async function unwrapBlobError(error: unknown): Promise<void> {
  if (!axios.isAxiosError(error) || !(error.response?.data instanceof Blob)) return;
  const text = await error.response.data.text();
  try {
    error.response.data = JSON.parse(text);
  } catch {
    error.response.data = text;
  }
}

/** Télécharge un fichier protégé par le jeton JWT (un simple lien <a> n'enverrait pas l'en-tête Authorization). */
export async function downloadFile(url: string, filename: string): Promise<void> {
  let blob: Blob;
  try {
    const response = await api.get<Blob>(url, { responseType: 'blob', timeout: 30000 });
    blob = response.data;
  } catch (error) {
    await unwrapBlobError(error);
    throw error;
  }

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Libérer l'URL tout de suite peut annuler le téléchargement dans certains navigateurs
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
}
