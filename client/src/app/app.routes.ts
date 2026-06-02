import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register').then((m) => m.Register),
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout').then((m) => m.Layout),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'supporters',
        loadComponent: () =>
          import('./features/supporters/supporters-list').then((m) => m.SupportersListComponent),
      },
      {
        path: 'supporters/new',
        loadComponent: () =>
          import('./features/supporters/supporter-form').then((m) => m.SupporterFormComponent),
      },
      {
        path: 'supporters/:id/edit',
        loadComponent: () =>
          import('./features/supporters/supporter-form').then((m) => m.SupporterFormComponent),
      },
      {
        path: 'supporters/:id',
        loadComponent: () =>
          import('./features/supporters/supporter-detail').then((m) => m.SupporterDetailComponent),
      },
      {
        path: 'offerings',
        loadComponent: () => import('./features/offerings/offerings').then((m) => m.OfferingsComponent),
      },
      {
        path: 'calls',
        loadComponent: () => import('./features/calls/call-agenda').then((m) => m.CallAgendaComponent),
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports').then((m) => m.ReportsComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings').then((m) => m.SettingsComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
