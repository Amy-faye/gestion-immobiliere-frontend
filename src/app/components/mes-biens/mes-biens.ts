import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BienService } from '../../services/bien';
import { AuthService, CurrentUser } from '../../services/auth';

interface Bien {
  id: number;
  type: string;
  adresse: string;
  description: string;
  loyer_mensuel: number;
  statut: string;
  photo?: string;
  gestionnaire?: { name: string; email: string };
}

@Component({
  selector: 'app-mes-biens',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-biens.html',
  styleUrl: './mes-biens.css',
})
export class MesBiens implements OnInit {
  user: CurrentUser | null = null;
  biens: Bien[] = [];
  isLoading = false;
  errorMessage = '';

  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 10;

  selectedBien: Bien | null = null;

  openDetail(bien: Bien): void {
    this.selectedBien = bien;
    this.cdr.detectChanges();

  }

  closeDetail(): void {
    this.selectedBien = null;
    this.cdr.detectChanges();

  }
  constructor(
    private bienService: BienService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadBiens();
  }

  loadBiens(page: number = 1): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bienService.getBiens(page, this.perPage).subscribe({
      next: (res: any) => {
        this.biens = res.data ?? res;
        this.currentPage = res.current_page ?? 1;
        this.lastPage = res.last_page ?? 1;
        this.total = res.total ?? this.biens.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger vos biens.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.lastPage || page === this.currentPage) return;
    this.loadBiens(page);
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

  photoUrl(path: string): string {
    return `https://gestion-immobiliere-backend.onrender.com/storage/${path}`;
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
