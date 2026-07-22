import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';
import { AuthService, CurrentUser } from '../../services/auth';

interface UserItem {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  created_at?: string;
}

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateurs.html',
  styleUrl: './utilisateurs.css',
})
export class Utilisateurs implements OnInit {
  user: CurrentUser | null = null;
  users: UserItem[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  filterRole = '';

  showModal = false;
  form: UserItem = this.emptyForm();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const request = this.filterRole
      ? this.userService.getUsersByRole(this.filterRole)
      : this.userService.getAllUsers();

    request.subscribe({
      next: (res: any) => {
        this.users = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les utilisateurs.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onFilterChange(): void {
    this.loadUsers();
  }

  openAddModal(): void {
    this.form = this.emptyForm();
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveUser(): void {
    if (this.isSaving) return;

    if (!this.form.name || !this.form.email || !this.form.password || !this.form.role) {
      this.errorMessage = 'Merci de remplir tous les champs.';
      return;
    }

    if (this.form.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    this.isSaving = true;

    this.userService.createUser(this.form).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadUsers();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage =
          err.status === 422
            ? 'Cet email est déjà utilisé.'
            : "Erreur lors de la création de l'utilisateur.";
        this.cdr.detectChanges();
      },
    });
  }

  deleteUser(item: UserItem): void {
    if (!confirm(`Supprimer le compte de "${item.name}" ?`)) {
      return;
    }

    this.userService.deleteUser(item.id!).subscribe({
      next: () => this.loadUsers(),
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
        this.cdr.detectChanges();
      },
    });
  }

  roleLabel(role: string): string {
    const labels: Record<string, string> = {
      administrateur: 'Administrateur',
      gestionnaire: 'Gestionnaire',
      locataire: 'Locataire',
      proprietaire: 'Propriétaire',
    };
    return labels[role] ?? role;
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

  private emptyForm(): UserItem {
    return {
      name: '',
      email: '',
      password: '',
      role: 'locataire',
    };
  }
}
