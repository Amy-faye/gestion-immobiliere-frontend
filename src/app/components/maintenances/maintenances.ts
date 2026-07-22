import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MaintenanceService } from '../../services/maintenance';
import { ReclamationService } from '../../services/reclamation';
import { AuthService, CurrentUser } from '../../services/auth';

interface Maintenance {
  id?: number;
  description_travaux: string;
  cout: number;
  date_intervention: string;
  statut: string;
  reclamation_id: number | null;
  reclamation?: {
    type_incident: string;
    bien?: { type: string; adresse: string };
    locataire?: { name: string };
  };
}

interface ReclamationOption {
  id: number;
  type_incident: string;
  bien?: { type: string; adresse: string };
  locataire?: { name: string };
}

@Component({
  selector: 'app-maintenances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maintenances.html',
  styleUrl: './maintenances.css',
})
export class Maintenances implements OnInit {
  user: CurrentUser | null = null;
  maintenances: Maintenance[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  reclamationsOptions: ReclamationOption[] = [];

  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 10;

  showModal = false;
  isEditMode = false;
  form: Maintenance = this.emptyForm();

  constructor(
    private maintenanceService: MaintenanceService,
    private reclamationService: ReclamationService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadMaintenances();
    this.loadReclamations();
  }

  loadReclamations(): void {
    this.reclamationService.getReclamations(1, 200).subscribe({
      next: (res: any) => {
        this.reclamationsOptions = res.data ?? res;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  loadMaintenances(page: number = 1): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.maintenanceService.getMaintenances(page, this.perPage).subscribe({
      next: (res: any) => {
        this.maintenances = res.data ?? res;
        this.currentPage = res.current_page ?? 1;
        this.lastPage = res.last_page ?? 1;
        this.total = res.total ?? this.maintenances.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les maintenances.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.lastPage || page === this.currentPage) return;
    this.loadMaintenances(page);
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

  openAddModal(): void {
    this.isEditMode = false;
    this.form = this.emptyForm();
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(maintenance: Maintenance): void {
    this.isEditMode = true;
    this.form = { ...maintenance };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.detectChanges();

  }

  saveMaintenance(): void {
    if (this.isSaving) return;

    if (!this.form.reclamation_id || !this.form.description_travaux || !this.form.cout || !this.form.date_intervention) {
      this.errorMessage = 'Merci de remplir les champs obligatoires.';
      return;
    }

    this.isSaving = true;

    const payload = {
      description_travaux: this.form.description_travaux,
      cout: this.form.cout,
      date_intervention: this.form.date_intervention,
      statut: this.form.statut,
      reclamation_id: this.form.reclamation_id,
    };

    const request = this.isEditMode
      ? this.maintenanceService.updateMaintenance(this.form.id!, payload)
      : this.maintenanceService.createMaintenance(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadMaintenances(this.currentPage);
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = "Erreur lors de l'enregistrement de la maintenance.";
        this.cdr.detectChanges();
      },
    });
  }

  deleteMaintenance(maintenance: Maintenance): void {
    if (!confirm(`Supprimer cette intervention de maintenance ?`)) {
      return;
    }

    this.maintenanceService.deleteMaintenance(maintenance.id!).subscribe({
      next: () => this.loadMaintenances(this.currentPage),
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
        this.cdr.detectChanges();
      },
    });
  }

  statutLabel(statut: string): string {
    const labels: Record<string, string> = {
      planifiee: 'Planifiée',
      en_cours: 'En cours',
      terminee: 'Terminée',
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

  private emptyForm(): Maintenance {
    return {
      description_travaux: '',
      cout: 0,
      date_intervention: '',
      statut: 'planifiee',
      reclamation_id: null,
    };
  }
}
