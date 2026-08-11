import { Routes } from '@angular/router';

import { Layout } from './shared/layout/layout';
import { Dashboard } from './features/dashboard/dashboard';
import { Stations } from './features/stations/stations';
import { Reservations } from './features/reservations/reservations';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'stations', component: Stations },
      { path: 'reservations', component: Reservations },
    ],
  },
];