import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BienService } from '../../services/bien';
import { AuthService, CurrentUser } from '../../services/auth';
import { UserService } from '../../services/user';

interface Bien {
  id?: number;
  type: string;
  adresse: string;
  description: string;
  loyer_mensuel: number;
  statut: string;
  photo?: string;
  proprietaire_id: number | null;
  gestionnaire_id: number | null;
}

@Component({
  selector: 'app-biens',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './biens.html',
  styleUrl: './biens.css',
})
export class Biens implements OnInit {
  user: CurrentUser | null = null;
  biens: Bien[] = [];
  isLoading = false;
  errorMessage = '';
  isSaving = false;

  // --- Pagination ---
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 10;

  showModal = false;
  isEditMode = false;
  form: Bien = this.emptyForm();

  selectedPhoto: File | null = null;
  photoPreviewUrl: string | null = null;

  proprietairesOptions: { id: number; name: string; email: string }[] = [];
  gestionnairesOptions: { id: number; name: string; email: string }[] = [];

  constructor(
    private bienService: BienService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadBiens();
    this.loadOptions();
  }
  loadOptions(): void {
    this.userService.getUsersByRole('proprietaire').subscribe({
      next: (res: any) => {
        this.proprietairesOptions = res;
        this.cdr.detectChanges();
      },
      error: () => {},
    });

    this.userService.getUsersByRole('gestionnaire').subscribe({
      next: (res: any) => {
        this.gestionnairesOptions = res;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
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
        this.errorMessage = 'Impossible de charger les biens.';
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

  openAddModal(): void {
    this.isEditMode = false;
    this.form = this.emptyForm();
    this.selectedPhoto = null;
    this.photoPreviewUrl = null;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(bien: Bien): void {
    this.isEditMode = true;
    this.form = { ...bien };
    this.selectedPhoto = null;
    this.photoPreviewUrl = bien.photo ? this.photoUrl(bien.photo) : null;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedPhoto = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreviewUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  photoUrl(path: string): string {
    return `http://127.0.0.1:8000/storage/${path}`;
  }

  saveBien(): void {
    if (this.isSaving) return;

    if (!this.form.type || !this.form.adresse || !this.form.loyer_mensuel) {
      this.errorMessage = 'Merci de remplir les champs obligatoires.';
      return;
    }

    this.isSaving = true;

    const formData = new FormData();
    formData.append('type', this.form.type);
    formData.append('adresse', this.form.adresse);
    formData.append('description', this.form.description ?? '');
    formData.append('loyer_mensuel', String(this.form.loyer_mensuel));
    formData.append('statut', this.form.statut);
    if (this.form.proprietaire_id) {
      formData.append('proprietaire_id', String(this.form.proprietaire_id));
    }
    if (this.form.gestionnaire_id) {
      formData.append('gestionnaire_id', String(this.form.gestionnaire_id));
    }
    if (this.selectedPhoto) {
      formData.append('photo', this.selectedPhoto);
    }

    const request = this.isEditMode
      ? this.bienService.updateBien(this.form.id!, formData)
      : this.bienService.createBien(formData);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadBiens(this.currentPage);
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = "Erreur lors de l'enregistrement du bien.";
        this.cdr.detectChanges();
      },
    });
  }

  deleteBien(bien: Bien): void {
    if (!confirm(`Supprimer le bien "${bien.type} - ${bien.adresse}" ?`)) {
      return;
    }

    this.bienService.deleteBien(bien.id!).subscribe({
      next: () => this.loadBiens(this.currentPage),
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
        this.cdr.detectChanges();
      },
    });
  }

  statutLabel(statut: string): string {
    const labels: Record<string, string> = {
      disponible: 'Disponible',
      loue: 'Loué',
      en_maintenance: 'En maintenance',
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

  private emptyForm(): Bien {
    return {
      type: '',
      adresse: '',
      description: '',
      loyer_mensuel: 0,
      statut: 'disponible',
      photo: '',
      proprietaire_id: null,
      gestionnaire_id: null,
    };
  }
}
