import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReclamationService } from '../../services/reclamation';
import { ContratService } from '../../services/contrat';
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
}

interface BienOption {
  id: number;
  type: string;
  adresse: string;
}

@Component({
  selector: 'app-mes-reclamations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mes-reclamations.html',
  styleUrl: './mes-reclamations.css',
})
export class MesReclamations implements OnInit {
  user: CurrentUser | null = null;
  reclamations: Reclamation[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  biensOptions: BienOption[] = [];

  showModal = false;
  form: Reclamation = this.emptyForm();

  constructor(
    private reclamationService: ReclamationService,
    private contratService: ContratService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadReclamations();
    this.loadBiens();
  }

  loadBiens(): void {
    this.contratService.getContrats(1, 50).subscribe({
      next: (res: any) => {
        const contrats = res.data ?? res;
        const biensMap = new Map<number, BienOption>();
        contrats.forEach((c: any) => {
          if (c.bien) {
            biensMap.set(c.bien_id, {
              id: c.bien_id,
              type: c.bien.type,
              adresse: c.bien.adresse,
            });
          }
        });
        this.biensOptions = Array.from(biensMap.values());
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  loadReclamations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reclamationService.getReclamations(1, 50).subscribe({
      next: (res: any) => {
        this.reclamations = res.data ?? res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger vos réclamations.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openAddModal(): void {
    this.form = this.emptyForm();
    this.errorMessage = '';
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  saveReclamation(): void {
    if (this.isSaving) return;

    if (!this.form.bien_id || !this.form.type_incident || !this.form.description) {
      this.errorMessage = 'Merci de remplir tous les champs.';
      return;
    }

    this.isSaving = true;

    const payload = {
      type_incident: this.form.type_incident,
      description: this.form.description,
      date_declaration: new Date().toISOString().slice(0, 10),
      statut: 'ouverte',
      bien_id: this.form.bien_id,
      locataire_id: this.user?.id,
    };

    this.reclamationService.createReclamation(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadReclamations();
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = "Erreur lors de l'envoi de votre réclamation.";
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

  private emptyForm(): Reclamation {
    return {
      type_incident: 'plomberie',
      description: '',
      date_declaration: '',
      statut: 'ouverte',
      bien_id: null,
      locataire_id: null,
    };
  }
}
