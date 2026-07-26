import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CurrentUser } from '../../services/auth';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil implements OnInit {
  user: CurrentUser | null = null;

  name = '';
  telephone = '';
  password = '';
  passwordConfirmation = '';

  photoFile: File | null = null;
  photoPreview: string | null = null;

  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.authService.getMe().subscribe({
      next: (res: CurrentUser) => {
        this.user = res;
        this.name = res.name;
        this.telephone = res.telephone ?? '';
        this.photoPreview = res.photo_url ?? null;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger votre profil.';
        this.cdr.detectChanges();
      },
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.photoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.photoFile);
    }
  }

  save(): void {
    if (this.isSaving) return;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.password && this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    if (this.password && this.password !== this.passwordConfirmation) {
      this.errorMessage = 'La confirmation du mot de passe ne correspond pas.';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('telephone', this.telephone ?? '');
    if (this.password) {
      formData.append('password', this.password);
      formData.append('password_confirmation', this.passwordConfirmation);
    }
    if (this.photoFile) {
      formData.append('photo', this.photoFile);
    }

    this.isSaving = true;

    this.authService.updateProfile(formData).subscribe({
      next: (res: CurrentUser) => {
        this.isSaving = false;
        this.successMessage = 'Profil mis à jour avec succès.';
        this.user = res;
        this.authService.saveUser(res);
        this.password = '';
        this.passwordConfirmation = '';
        this.photoFile = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Erreur lors de la mise à jour du profil.';
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
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
