import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  private authService = inject(AuthService);
  private router = inject(Router);

  todayEnergyMwh = 0.6;

  navItems = [
    { label: 'Vue d\'ensemble', route: '/dashboard', icon: 'grid' },
    { label: 'Stations & Bornes', route: '/stations', icon: 'map-pin' },
    { label: 'Réservations', route: '/reservations', icon: 'calendar' },
    { label: 'Utilisateurs', route: '/utilisateurs', icon: 'users' },
    { label: 'Accès & Alertes', route: '/alertes', icon: 'shield' },
    { label: 'Export données', route: '/export', icon: 'download' },
  ];

  get userEmail(): string {
    return this.authService.currentUser()?.email ?? '';
  }

  get userInitials(): string {
    return this.userEmail ? this.userEmail.substring(0, 2).toUpperCase() : '??';
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}