export type UserRole = 'administrateur' | 'gestionnaire' | 'locataire' | 'proprietaire';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}
