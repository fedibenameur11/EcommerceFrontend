import api from './axiosInstance';
import type { CreateReturn, ReturnOptions, ReturnRequest, ReturnStatus } from '@/models/returns';

export const returnService = {
  getOptions: async (): Promise<ReturnOptions> => (await api.get<ReturnOptions>('/returns/options')).data,

  /** Client : demande de retour sur une ligne de commande livrée */
  create: async (data: CreateReturn): Promise<ReturnRequest> => (await api.post<ReturnRequest>('/returns', data)).data,

  /** Client : mes demandes de retour */
  getMine: async (): Promise<ReturnRequest[]> => (await api.get<ReturnRequest[]>('/returns/mine')).data,

  /** Admin : toutes les demandes (filtrables par statut) */
  getAll: async (status?: ReturnStatus): Promise<ReturnRequest[]> =>
    (await api.get<ReturnRequest[]>('/returns', { params: { status } })).data,

  /** Admin : fait avancer une demande (accepter, refuser, réceptionner, rembourser) */
  updateStatus: async (id: number, status: ReturnStatus, adminNote = ''): Promise<void> => {
    await api.put(`/returns/${id}/status`, { status, adminNote });
  },
};

export default returnService;
