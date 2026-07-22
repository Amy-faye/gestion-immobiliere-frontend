export interface Paiement {
  id: number;
  montant: number;
  date_paiement: string;
  mode_paiement: string; // ex: 'especes' | 'virement' | 'wave' | 'orange_money'
  statut: string; // ex: 'paye' | 'en_attente' | 'en_retard'
  quittance_pdf?: string;
  contrat_id: number;
  locataire_id: number;
  created_at?: string;
  updated_at?: string;
}
