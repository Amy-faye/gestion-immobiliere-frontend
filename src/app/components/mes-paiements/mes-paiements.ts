import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaiementService } from '../../services/paiement';
import { AuthService, CurrentUser } from '../../services/auth';

interface Paiement {
  id: number;
  montant: number;
  date_paiement: string;
  mode_paiement: string;
  statut: string;
  contrat?: { bien?: { type: string; adresse: string } };
}

@Component({
  selector: 'app-mes-paiements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-paiements.html',
  styleUrl: './mes-paiements.css',
})
export class MesPaiements implements OnInit {
  user: CurrentUser | null = null;
  paiements: Paiement[] = [];
  isLoading = false;
  errorMessage = '';

  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 10;

  constructor(
    private paiementService: PaiementService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadPaiements();
  }

  loadPaiements(page: number = 1): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.paiementService.getPaiements(page, this.perPage).subscribe({
      next: (res: any) => {
        this.paiements = res.data ?? res;
        this.currentPage = res.current_page ?? 1;
        this.lastPage = res.last_page ?? 1;
        this.total = res.total ?? this.paiements.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger vos paiements.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.lastPage || page === this.currentPage) return;
    this.loadPaiements(page);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.lastPage }, (_, i) => i + 1);
  }
  downloadQuittance(paiement: Paiement): void {
    this.paiementService.downloadQuittance(paiement.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quittance-${paiement.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.errorMessage = 'Impossible de télécharger la quittance.';
        this.cdr.detectChanges();
      },
    });
  }

  modeLabel(mode: string): string {
    const labels: Record<string, string> = {
      especes: 'Espèces',
      virement: 'Virement',
      wave: 'Wave',
      orange_money: 'Orange Money',
    };
    return labels[mode] ?? mode;
  }

  statutLabel(statut: string): string {
    const labels: Record<string, string> = {
      paye: 'Payé',
      en_attente: 'En attente',
      en_retard: 'En retard',
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
