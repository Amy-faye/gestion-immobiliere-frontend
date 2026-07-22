import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-mot-de-passe-oublie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mot-de-passe-oublie.html',
  styleUrl: './mot-de-passe-oublie.css',
})
export class MotDePasseOublie {
  email = '';
  isLoading = false;
  message = '';
  errorMessage = '';
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage = 'Merci de saisir votre adresse email.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.message = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.submitted = true;
        this.message = res.message ?? 'Un lien de réinitialisation a été envoyé à votre adresse email.';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.';
      },
    });
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
