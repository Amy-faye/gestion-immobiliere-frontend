export interface Reclamation {
  id: number;
  type_incident: string;
  description: string;
  date_declaration: string;
  statut: string; // ex: 'ouverte' | 'en_cours' | 'resolue'
  locataire_id: number;
  bien_id: number;
  created_at?: string;
  updated_at?: string;
}
