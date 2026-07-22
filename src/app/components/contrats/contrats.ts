import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContratService } from '../../services/contrat';
import { BienService } from '../../services/bien';
import { UserService } from '../../services/user';
import { AuthService, CurrentUser } from '../../services/auth';

interface Contrat {
  id?: number;
  date_debut: string;
  date_fin: string;
  loyer_mensuel: number;
  caution: number;
  statut: string;
  fichier_pdf?: string;
  bien_id: number | null;
  locataire_id: number | null;
  bien?: { id: number; type: string; adresse: string };
  locataire?: { id: number; name: string };
}

interface BienOption {
  id: number;
  type: string;
  adresse: string;
}

interface UserOption {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-contrats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contrats.html',
  styleUrl: './contrats.css',
})
export class Contrats implements OnInit {
  user: CurrentUser | null = null;
  contrats: Contrat[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  // Options pour les listes déroulantes
  biensOptions: BienOption[] = [];
  locatairesOptions: UserOption[] = [];

  // Pagination
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 10;

  showModal = false;
  isEditMode = false;
  form: Contrat = this.emptyForm();

  constructor(
    private contratService: ContratService,
    private bienService: BienService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadContrats();
    this.loadOptions();
  }

  loadOptions(): void {
    this.bienService.getAllBiens().subscribe({
      next: (res: any) => {
        this.biensOptions = res.data ?? res;
        this.cdr.detectChanges();
      },
      error: () => {},
    });

    this.userService.getUsersByRole('locataire').subscribe({
      next: (res: any) => {
        this.locatairesOptions = res;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  loadContrats(page: number = 1): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.contratService.getContrats(page, this.perPage).subscribe({
      next: (res: any) => {
        this.contrats = res.data ?? res;
        this.currentPage = res.current_page ?? 1;
        this.lastPage = res.last_page ?? 1;
        this.total = res.total ?? this.contrats.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les contrats.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.lastPage || page === this.currentPage) return;
    this.loadContrats(page);
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
  }

  openEditModal(contrat: Contrat): void {
    this.isEditMode = true;
    this.form = { ...contrat };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveContrat(): void {
    if (this.isSaving) return;

    if (
      !this.form.date_debut ||
      !this.form.date_fin ||
      !this.form.loyer_mensuel ||
      !this.form.bien_id ||
      !this.form.locataire_id
    ) {
      this.errorMessage = 'Merci de remplir les champs obligatoires.';
      return;
    }

    this.isSaving = true;

    const payload = {
      date_debut: this.form.date_debut,
      date_fin: this.form.date_fin,
      loyer_mensuel: this.form.loyer_mensuel,
      caution: this.form.caution,
      statut: this.form.statut,
      bien_id: this.form.bien_id,
      locataire_id: this.form.locataire_id,
    };

    const request = this.isEditMode
      ? this.contratService.updateContrat(this.form.id!, payload)
      : this.contratService.createContrat(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadContrats(this.currentPage);
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = "Erreur lors de l'enregistrement du contrat.";
        this.cdr.detectChanges();
      },
    });
  }

  deleteContrat(contrat: Contrat): void {
    if (!confirm(`Résilier ce contrat (bien : ${contrat.bien?.type ?? ''}) ?`)) {
      return;
    }

    this.contratService.deleteContrat(contrat.id!).subscribe({
      next: () => this.loadContrats(this.currentPage),
      error: () => {
        this.errorMessage = 'Erreur lors de la résiliation.';
        this.cdr.detectChanges();
      },
    });
  }

  statutLabel(statut: string): string {
    const labels: Record<string, string> = {
      actif: 'Actif',
      terminé: 'Terminé',
      termine: 'Terminé',
      résilié: 'Résilié',
      resilie: 'Résilié',
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

  private emptyForm(): Contrat {
    return {
      date_debut: '',
      date_fin: '',
      loyer_mensuel: 0,
      caution: 0,
      statut: 'actif',
      bien_id: null,
      locataire_id: null,
    };
  }
  downloadContrat(contrat: Contrat): void {
    this.contratService.downloadContrat(contrat.id!).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contrat-${contrat.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.errorMessage = 'Impossible de télécharger le contrat.';
        this.cdr.detectChanges();
      },
    });
  }
}
