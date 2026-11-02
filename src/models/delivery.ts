export interface DeliveryDay {
  date: string;
  deliveries: number;
  earnings: number;
}

/** Statistiques du livreur sur une période (7 = semaine, 30 = mois) */
export interface DeliveryStats {
  currency: string;
  days: number;
  deliveredCount: number;
  /** Gains : somme des frais de livraison des commandes livrées */
  earnings: number;
  /** Espèces encaissées auprès des clients, à reverser à la boutique */
  cashCollected: number;
  pendingAssignments: number;
  inProgress: number;
  daily: DeliveryDay[];
}
