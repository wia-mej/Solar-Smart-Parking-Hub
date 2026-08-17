import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  password = '';
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  submit(): void {
    this.loading = true;
    this.errorMessage = null;

    this.authService
      .login(this.email, this.password)
      .then(() => {
        this.router.navigate(['/dashboard']);
      })
      .catch(() => {
        this.errorMessage = 'Email ou mot de passe incorrect.';
        this.loading = false;
        this.cdr.detectChanges();
      });
  }
}