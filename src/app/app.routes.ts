import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Biens } from './components/biens/biens';
import { Contrats } from './components/contrats/contrats';
import { Paiements } from './components/paiements/paiements';
import { Reclamations } from './components/reclamations/reclamations';
import { Maintenances } from './components/maintenances/maintenances';
import { Utilisateurs } from './components/utilisateurs/utilisateurs';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { MonContrat } from './components/mon-contrat/mon-contrat';
import { MesBiens } from './components/mes-biens/mes-biens';
import { MesPaiements } from './components/mes-paiements/mes-paiements';
import { MesReclamations } from './components/mes-reclamations/mes-reclamations';
import { RapportFinancier } from './components/rapport-financier/rapport-financier';
import { Accueil } from './components/accueil/accueil';
import { MotDePasseOublie } from './components/mot-de-passe-oublie/mot-de-passe-oublie';
import { ReinitialiserMotDePasse } from './components/reinitialiser-mot-de-passe/reinitialiser-mot-de-passe';
export const routes: Routes = [
  { path: '', component: Accueil },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },
  {
    path: 'biens',
    component: Biens,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrateur', 'gestionnaire'] },
  },
  {
    path: 'contrats',
    component: Contrats,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrateur', 'gestionnaire'] },
  },
  {
    path: 'paiements',
    component: Paiements,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrateur', 'gestionnaire'] },
  },
  {
    path: 'reclamations',
    component: Reclamations,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrateur', 'gestionnaire'] },
  },
  {
    path: 'maintenances',
    component: Maintenances,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrateur', 'gestionnaire'] },
  },
  {
    path: 'utilisateurs',
    component: Utilisateurs,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrateur', 'gestionnaire'] },
  },
  {
    path: 'mon-contrat',
    component: MonContrat,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['locataire'] },
  },
  {
    path: 'mes-biens',
    component: MesBiens,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['proprietaire'] },
  },
  {
    path: 'mes-paiements',
    component: MesPaiements,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['locataire'] },
  },
  {
    path: 'mes-reclamations',
    component: MesReclamations,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['locataire'] },
  },
  {
    path: 'rapport-financier',
    component: RapportFinancier,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['proprietaire'] },
  },
  { path: 'mot-de-passe-oublie', component: MotDePasseOublie },
  { path: 'reinitialiser-mot-de-passe', component: ReinitialiserMotDePasse },
];
