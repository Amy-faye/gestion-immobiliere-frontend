import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, CurrentUser } from '../../services/auth';
import { BienService } from '../../services/bien';
import { ContratService } from '../../services/contrat';
import { PaiementService } from '../../services/paiement';
import { ReclamationService } from '../../services/reclamation';
import { MaintenanceService } from '../../services/maintenance';

interface ActivityItem {
  type: 'contrat' | 'paiement' | 'reclamation';
  label: string;
  detail: string;
  date: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  user: CurrentUser | null = null;

  biensCount = 0;
  contratsCount = 0;
  paiementsCount = 0;
  reclamationsCount = 0;
  maintenancesCount = 0;
  isLoading = true;

  biensParStatut: { statut: string; label: string; count: number }[] = [];
  maxStatutCount = 1;

  activityItems: ActivityItem[] = [];

  constructor(
    private authService: AuthService,
    private bienService: BienService,
    private contratService: ContratService,
    private paiementService: PaiementService,
    private reclamationService: ReclamationService,
    private maintenanceService: MaintenanceService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadStats();
  }

  loadStats(): void {
    if (this.user?.role !== 'administrateur' && this.user?.role !== 'gestionnaire') {
      return;
    }

    this.bienService.getBiens(1, 200).subscribe({
      next: (res: any) => {
        const biens = res.data ?? res;
        this.biensCount = res.total ?? biens.length;
        this.computeBiensParStatut(biens);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });

    this.contratService.getContrats(1, 5).subscribe({
      next: (res: any) => {
        const contrats = res.data ?? res;
        this.contratsCount = res.total ?? contrats.length;
        contrats.forEach((c: any) => {
          this.activityItems.push({
            type: 'contrat',
            label: 'Nouveau contrat',
            detail: `${c.bien?.type ?? ''} — ${c.locataire?.name ?? ''}`,
            date: c.created_at ?? c.date_debut,
          });
        });
        this.sortAndTrimActivity();
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });

    this.paiementService.getPaiements(1, 5).subscribe({
      next: (res: any) => {
        const paiements = res.data ?? res;
        this.paiementsCount = res.total ?? paiements.length;
        paiements.forEach((p: any) => {
          this.activityItems.push({
            type: 'paiement',
            label: 'Paiement reçu',
            detail: `${p.locataire?.name ?? ''} — ${Number(p.montant).toLocaleString('fr-FR')} FCFA`,
            date: p.created_at ?? p.date_paiement,
          });
        });
        this.sortAndTrimActivity();
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });

    this.reclamationService.getReclamations(1, 5).subscribe({
      next: (res: any) => {
        const reclamations = res.data ?? res;
        this.reclamationsCount = res.total ?? reclamations.length;
        reclamations.forEach((r: any) => {
          this.activityItems.push({
            type: 'reclamation',
            label: 'Réclamation signalée',
            detail: `${r.bien?.type ?? ''} — ${r.type_incident}`,
            date: r.created_at ?? r.date_declaration,
          });
        });
        this.sortAndTrimActivity();
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });

    this.maintenanceService.getMaintenances().subscribe({
      next: (res: any) => {
        this.maintenancesCount =
          res.total ?? (Array.isArray(res) ? res.length : (res.data?.length ?? 0));
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });
  }

  private computeBiensParStatut(biens: any[]): void {
    const counts: Record<string, number> = {
      disponible: 0,
      loue: 0,
      en_maintenance: 0,
      archivé: 0,
    };

    biens.forEach((b) => {
      if (counts[b.statut] !== undefined) {
        counts[b.statut]++;
      } else {
        counts[b.statut] = 1;
      }
    });

    const labels: Record<string, string> = {
      disponible: 'Disponible',
      loue: 'Loué',
      en_maintenance: 'En maintenance',
      archivé: 'Archivé',
    };

    this.biensParStatut = Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([statut, count]) => ({ statut, label: labels[statut] ?? statut, count }));

    this.maxStatutCount = Math.max(1, ...this.biensParStatut.map((s) => s.count));
  }

  private sortAndTrimActivity(): void {
    const unique = new Map<string, ActivityItem>();
    this.activityItems.forEach((item) => {
      unique.set(`${item.type}-${item.detail}-${item.date}`, item);
    });

    this.activityItems = Array.from(unique.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }

  barHeight(count: number): number {
    return Math.max(8, (count / this.maxStatutCount) * 100);
  }

  activityIcon(type: string): string {
    const icons: Record<string, string> = {
      contrat: '📄',
      paiement: '💳',
      reclamation: '⚠️',
    };
    return icons[type] ?? '•';
  }

  get roleLabel(): string {
    const labels: Record<string, string> = {
      administrateur: 'Administrateur',
      gestionnaire: 'Gestionnaire Immobilier',
      locataire: 'Locataire',
      proprietaire: 'Propriétaire',
    };
    return labels[this.user?.role ?? ''] ?? 'Utilisateur';
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
