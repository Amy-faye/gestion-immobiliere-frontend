import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContratService } from '../../services/contrat';
import { PaiementService } from '../../services/paiement';
import { AuthService, CurrentUser } from '../../services/auth';

interface Contrat {
  id: number;
  date_debut: string;
  date_fin: string;
  loyer_mensuel: number;
  caution: number;
  statut: string;
  bien?: { type: string; adresse: string };
}

type PaymentStep = 'closed' | 'select' | 'processing' | 'confirm' | 'success' | 'error';

@Component({
  selector: 'app-mon-contrat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mon-contrat.html',
  styleUrl: './mon-contrat.css',
})
export class MonContrat implements OnInit {
  user: CurrentUser | null = null;
  contrats: Contrat[] = [];
  isLoading = false;
  errorMessage = '';

  paymentStep: PaymentStep = 'closed';
  paymentContrat: Contrat | null = null;
  paymentMethod: 'wave' | 'orange_money' | null = null;

  constructor(
    private contratService: ContratService,
    private paiementService: PaiementService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadContrats();
  }

  loadContrats(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.contratService.getContrats(1, 50).subscribe({
      next: (res: any) => {
        this.contrats = res.data ?? res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger votre contrat.';
        this.isLoading = false;
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

  openPayment(contrat: Contrat): void {
    this.paymentContrat = contrat;
    this.paymentMethod = null;
    this.paymentStep = 'select';
    this.cdr.detectChanges();
  }

  closePayment(): void {
    this.paymentStep = 'closed';
    this.paymentContrat = null;
    this.paymentMethod = null;
    this.cdr.detectChanges();
  }

  selectMethod(method: 'wave' | 'orange_money'): void {
    this.paymentMethod = method;
    this.paymentStep = 'processing';
    this.cdr.detectChanges();

    setTimeout(() => {
      this.paymentStep = 'confirm';
      this.cdr.detectChanges();
    }, 1800);
  }

  confirmPayment(): void {
    if (!this.paymentContrat || !this.paymentMethod) return;

    this.paymentStep = 'processing';
    this.cdr.detectChanges();

    const payload = {
      montant: this.paymentContrat.loyer_mensuel,
      date_paiement: new Date().toISOString().slice(0, 10),
      mode_paiement: this.paymentMethod,
      statut: 'paye',
      contrat_id: this.paymentContrat.id,
      locataire_id: this.user?.id,
    };

    setTimeout(() => {
      this.paiementService.createPaiement(payload).subscribe({
        next: () => {
          this.paymentStep = 'success';
          this.cdr.detectChanges();
        },
        error: () => {
          this.paymentStep = 'error';
          this.cdr.detectChanges();
        },
      });
    }, 1200);
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
