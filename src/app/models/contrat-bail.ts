export interface ContratBail {
  id: number;
  date_debut: string;
  date_fin: string;
  loyer_mensuel: number;
  caution: number;
  statut: string; // ex: 'actif' | 'termine' | 'resilie'
  fichier_pdf?: string;
  bien_id: number;
  locataire_id: number;
  created_at?: string;
  updated_at?: string;
}
