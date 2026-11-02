import api from './axiosInstance';

export interface AuditLog {
  id: number;
  timestamp: string;
  userId: number | null;
  userEmail: string;
  action: 'Create' | 'Update' | 'Delete' | string;
  entityName: string;
  entityId: string;
  /** JSON : { "Champ": { "old": ..., "new": ... } } (ou valeur simple pour une création / suppression) */
  changes: string;
  ipAddress: string;
}

export interface AuditLogPage {
  items: AuditLog[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  /** Types d'entités présents dans le journal */
  entities: string[];
}

export interface AuditLogQuery {
  page?: number;
  pageSize?: number;
  entity?: string;
  action?: string;
  user?: string;
  from?: string;
  to?: string;
}

/**
 * Audit Service (administrateur) : journal des modifications de données
 */
export const auditService = {
  getLogs: async (query: AuditLogQuery): Promise<AuditLogPage> => {
    const response = await api.get<AuditLogPage>('/audit-logs', { params: query });
    return response.data;
  },
};

export default auditService;
