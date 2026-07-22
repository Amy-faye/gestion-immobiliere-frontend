import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReclamationService } from '../../services/reclamation';
import { AuthService, CurrentUser } from '../../services/auth';

interface Reclamation {
  id?: number;
  type_incident: string;
  description: string;
  date_declaration: string;
  statut: string;
  bien_id: number | null;
  locataire_id: number | null;
  bien?: { type: string; adresse: string };
  locataire?: { name: string };
}

@Component({
  selector: 'app-reclamations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reclamations.html',
  styleUrl: './reclamations.css',
})
export class Reclamations implements OnInit {
  user: CurrentUser | null = null;
  reclamations: Reclamation[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  showDetailModal = false;
  selectedReclamation: Reclamation | null = null;
  newStatut = '';

  constructor(
    private reclamationService: ReclamationService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadReclamations();
  }

  loadReclamations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reclamationService.getReclamations(1, 200).subscribe({
      next: (res: any) => {
        this.reclamations = res.data ?? res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les réclamations.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get ouvertes(): Reclamation[] {
    return this.reclamations.filter((r) => r.statut === 'ouverte');
  }

  get enCours(): Reclamation[] {
    return this.reclamations.filter((r) => r.statut === 'en_cours');
  }

  get resolues(): Reclamation[] {
    return this.reclamations.filter((r) => r.statut === 'resolue');
  }

  openDetail(reclamation: Reclamation): void {
    this.selectedReclamation = reclamation;
    this.newStatut = reclamation.statut;
    this.showDetailModal = true;
    this.cdr.detectChanges();
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedReclamation = null;
    this.cdr.detectChanges();
  }

  updateStatut(): void {
    if (!this.selectedReclamation || this.isSaving) return;

    this.isSaving = true;

    this.reclamationService.updateReclamation(this.selectedReclamation.id!, {
      statut: this.newStatut,
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeDetail();
        this.loadReclamations();
        this.cdr.detectChanges();

      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Erreur lors de la mise à jour du statut.';
        this.cdr.detectChanges();
        this.cdr.detectChanges();

      },
    });
  }

  deleteReclamation(reclamation: Reclamation): void {
    if (!confirm(`Supprimer cette réclamation ?`)) {
      return;
    }

    this.reclamationService.deleteReclamation(reclamation.id!).subscribe({
      next: () => {
        this.closeDetail();
        this.loadReclamations();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
        this.cdr.detectChanges();
      },
    });
  }

  typeLabel(type: string): string {
    const labels: Record<string, string> = {
      plomberie: 'Plomberie',
      electricite: 'Électricité',
      chauffage: 'Chauffage',
      serrurerie: 'Serrurerie',
      autre: 'Autre',
    };
    return labels[type] ?? type;
  }

  statutLabel(statut: string): string {
    const labels: Record<string, string> = {
      ouverte: 'Ouverte',
      en_cours: 'En cours',
      resolue: 'Résolue',
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
