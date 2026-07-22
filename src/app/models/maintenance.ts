export interface Maintenance {
  id: number;
  description_travaux: string;
  cout: number;
  date_intervention: string;
  facture_pdf?: string;
  statut: string; // ex: 'planifiee' | 'en_cours' | 'terminee'
  reclamation_id: number;
  created_at?: string;
  updated_at?: string;
}
