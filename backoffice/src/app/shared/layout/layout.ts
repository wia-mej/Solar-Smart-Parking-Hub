import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  todayEnergyMwh = 0.6;

  navItems = [
    { label: 'Vue d\'ensemble', route: '/dashboard', icon: 'grid' },
    { label: 'Stations & Bornes', route: '/stations', icon: 'map-pin' },
    { label: 'Réservations', route: '/reservations', icon: 'calendar' },
    { label: 'Utilisateurs', route: '/utilisateurs', icon: 'users' },
    { label: 'Accès & Alertes', route: '/alertes', icon: 'shield' },
    { label: 'Export données', route: null, icon: 'download' },
  ];

  user = {
    initials: 'WJ',
    name: 'Wiame Jaoui',
    role: 'Admin',
  };
}