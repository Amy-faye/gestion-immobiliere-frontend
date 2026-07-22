import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reinitialiser-mot-de-passe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reinitialiser-mot-de-passe.html',
  styleUrl: './reinitialiser-mot-de-passe.css',
})
export class ReinitialiserMotDePasse implements OnInit {
  token = '';
  email = '';
  password = '';
  passwordConfirmation = '';
  isLoading = false;
  errorMessage = '';
  success = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] ?? '';
      this.email = params['email'] ?? '';
    });
  }

  onSubmit(): void {
    if (!this.password || !this.passwordConfirmation) {
      this.errorMessage = 'Merci de remplir tous les champs.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    if (this.password !== this.passwordConfirmation) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.resetPassword({
      token: this.token,
      email: this.email,
      password: this.password,
      password_confirmation: this.passwordConfirmation,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.success = true;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message ?? 'Ce lien est invalide ou a expiré.';
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
