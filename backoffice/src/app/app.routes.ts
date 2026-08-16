import { Routes } from '@angular/router';

import { Layout } from './shared/layout/layout';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Stations } from './features/stations/stations';
import { Reservations } from './features/reservations/reservations';
import { Alertes } from './features/alertes/alertes';
import { Utilisateurs } from './features/utilisateurs/utilisateurs';
import { Export } from './features/export/export';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'stations', component: Stations },
      { path: 'reservations', component: Reservations },
      { path: 'alertes', component: Alertes },
      { path: 'utilisateurs', component: Utilisateurs },
      { path: 'export', component: Export },
    ],
  },
];