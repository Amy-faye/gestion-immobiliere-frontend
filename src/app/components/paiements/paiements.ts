import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaiementService } from '../../services/paiement';
import { ContratService } from '../../services/contrat';
import { AuthService, CurrentUser } from '../../services/auth';

interface Paiement {
  id?: number;
  montant: number;
  date_paiement: string;
  mode_paiement: string;
  statut: string;
  contrat_id: number | null;
  locataire_id: number | null;
  contrat?: { id: number; bien?: { type: string; adresse: string } };
  locataire?: { id: number; name: string };
}

interface ContratOption {
  id: number;
  locataire_id: number;
  bien?: { type: string; adresse: string };
  locataire?: { name: string };
}

@Component({
  selector: 'app-paiements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paiements.html',
  styleUrl: './paiements.css',
})
export class Paiements implements OnInit {
  user: CurrentUser | null = null;
  paiements: Paiement[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  contratsOptions: ContratOption[] = [];

  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 10;

  showModal = false;
  isEditMode = false;
  form: Paiement = this.emptyForm();

  constructor(
    private paiementService: PaiementService,
    private contratService: ContratService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadPaiements();
    this.loadContrats();
  }

  loadContrats(): void {
    this.contratService.getContrats(1, 1000).subscribe({
      next: (res: any) => {
        this.contratsOptions = res.data ?? res;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
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
        this.errorMessage = 'Impossible de charger les paiements.';
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

  onContratChange(): void {
    const contrat = this.contratsOptions.find((c) => c.id === this.form.contrat_id);
    this.form.locataire_id = contrat ? contrat.locataire_id : null;
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.form = this.emptyForm();
    this.showModal = true;
    this.cdr.detectChanges();

  }

  openEditModal(paiement: Paiement): void {
    this.isEditMode = true;
    this.form = { ...paiement };
    this.showModal = true;
    this.cdr.detectChanges();

  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.detectChanges();

  }

  savePaiement(): void {
    if (this.isSaving) return;

    if (!this.form.contrat_id || !this.form.montant || !this.form.date_paiement || !this.form.mode_paiement) {
      this.errorMessage = 'Merci de remplir les champs obligatoires.';
      return;
    }

    this.isSaving = true;

    const payload = {
      montant: this.form.montant,
      date_paiement: this.form.date_paiement,
      mode_paiement: this.form.mode_paiement,
      statut: this.form.statut,
      contrat_id: this.form.contrat_id,
      locataire_id: this.form.locataire_id,
    };

    const request = this.isEditMode
      ? this.paiementService.updatePaiement(this.form.id!, payload)
      : this.paiementService.createPaiement(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadPaiements(this.currentPage);
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = "Erreur lors de l'enregistrement du paiement.";
        this.cdr.detectChanges();
      },
    });
  }

  deletePaiement(paiement: Paiement): void {
    if (!confirm(`Supprimer ce paiement de ${paiement.montant} FCFA ?`)) {
      return;
    }

    this.paiementService.deletePaiement(paiement.id!).subscribe({
      next: () => this.loadPaiements(this.currentPage),
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
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

  private emptyForm(): Paiement {
    return {
      montant: 0,
      date_paiement: '',
      mode_paiement: 'especes',
      statut: 'paye',
      contrat_id: null,
      locataire_id: null,
    };
  }
}
