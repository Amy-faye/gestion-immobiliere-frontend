import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BienService } from '../../services/bien';
import { PaiementService } from '../../services/paiement';
import { MaintenanceService } from '../../services/maintenance';
import { AuthService, CurrentUser } from '../../services/auth';

interface Bien {
  id: number;
  type: string;
  adresse: string;
  statut: string;
}

interface BienRapport {
  bien: Bien;
  revenus: number;
  depenses: number;
  net: number;
  nbPaiements: number;
}

@Component({
  selector: 'app-rapport-financier',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rapport-financier.html',
  styleUrl: './rapport-financier.css',
})
export class RapportFinancier implements OnInit {
  user: CurrentUser | null = null;
  isLoading = false;
  errorMessage = '';

  biens: Bien[] = [];
  totalRevenus = 0;
  totalEnAttente = 0;
  totalDepenses = 0;
  totalNet = 0;

  rapportParBien: BienRapport[] = [];

  constructor(
    private bienService: BienService,
    private paiementService: PaiementService,
    private maintenanceService: MaintenanceService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bienService.getBiens(1, 200).subscribe({
      next: (biensRes: any) => {
        this.biens = biensRes.data ?? biensRes;

        this.paiementService.getPaiements(1, 500).subscribe({
          next: (paiementsRes: any) => {
            const paiements = paiementsRes.data ?? paiementsRes;

            this.maintenanceService.getMaintenances(1, 500).subscribe({
              next: (maintenancesRes: any) => {
                const maintenances = maintenancesRes.data ?? maintenancesRes;
                this.computeReport(paiements, maintenances);
                this.isLoading = false;
                this.cdr.detectChanges();
              },
              error: () => {
                this.errorMessage = 'Impossible de charger les données de maintenance.';
                this.isLoading = false;
                this.cdr.detectChanges();
              },
            });
          },
          error: () => {
            this.errorMessage = 'Impossible de charger les paiements.';
            this.isLoading = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: () => {
        this.errorMessage = 'Impossible de charger vos biens.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private computeReport(paiements: any[], maintenances: any[]): void {
    this.totalRevenus = 0;
    this.totalEnAttente = 0;
    this.totalDepenses = 0;

    this.rapportParBien = this.biens.map((bien) => {
      const paiementsBien = paiements.filter((p) => p.contrat?.bien?.id === bien.id);
      const maintenancesBien = maintenances.filter((m) => m.reclamation?.bien?.id === bien.id);

      const revenus = paiementsBien
        .filter((p) => p.statut === 'paye')
        .reduce((sum, p) => sum + Number(p.montant), 0);

      const enAttente = paiementsBien
        .filter((p) => p.statut === 'en_attente' || p.statut === 'en_retard')
        .reduce((sum, p) => sum + Number(p.montant), 0);

      const depenses = maintenancesBien.reduce((sum, m) => sum + Number(m.cout), 0);

      this.totalRevenus += revenus;
      this.totalEnAttente += enAttente;
      this.totalDepenses += depenses;

      return {
        bien,
        revenus,
        depenses,
        net: revenus - depenses,
        nbPaiements: paiementsBien.filter((p) => p.statut === 'paye').length,
      };
    });

    this.totalNet = this.totalRevenus - this.totalDepenses;
  }

  statutLabel(statut: string): string {
    const labels: Record<string, string> = {
      disponible: 'Disponible',
      loue: 'Loué',
      en_maintenance: 'En maintenance',
      archivé: 'Archivé',
    };
    return labels[statut] ?? statut;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout().subscribe({
      complete: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout(): void {
    this.authService.removeToken();
    this.router.navigate(['/login']);
  }
}
