export interface BienImmobilier {
  id: number;
  type: string;
  adresse: string;
  description: string;
  loyer_mensuel: number;
  statut: string; // ex: 'disponible' | 'loue' | 'en_travaux'
  photo?: string;
  proprietaire_id: number;
  gestionnaire_id: number;
  created_at?: string;
  updated_at?: string;
}
