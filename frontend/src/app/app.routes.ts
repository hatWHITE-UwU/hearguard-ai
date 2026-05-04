import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/splash/splash.component').then((m) => m.SplashComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'auth',
    children: [
      { path: 'login', redirectTo: '/login', pathMatch: 'full' },
      { path: 'register', redirectTo: '/register', pathMatch: 'full' },
    ],
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/shell/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        data: { shellTitle: 'Dashboard' },
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'profile',
        data: { shellTitle: 'Perfil' },
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
      },
      {
        path: 'hearing/habits',
        data: { shellTitle: 'Prueba auditiva' },
        loadComponent: () =>
          import('./features/hearing-test/habit-form/habit-form.component').then(
            (m) => m.HabitFormComponent,
          ),
      },
      {
        path: 'hearing/test',
        data: { shellTitle: 'Test de audición' },
        loadComponent: () =>
          import('./features/hearing-test/hearing-test.component').then(
            (m) => m.HearingTestComponent,
          ),
      },
      {
        path: 'results/:id',
        data: { shellTitle: 'Resultados' },
        loadComponent: () =>
          import('./features/results/results.component').then(
            (m) => m.ResultsComponent,
          ),
      },
      {
        path: 'recommendations',
        data: { shellTitle: 'Recomendaciones' },
        loadComponent: () =>
          import('./features/recommendations/recommendations.component').then(
            (m) => m.RecommendationsComponent,
          ),
      },
      {
        path: 'monitor',
        data: { shellTitle: 'Monitoreo' },
        loadComponent: () =>
          import('./features/monitor/monitor.component').then(
            (m) => m.MonitorComponent,
          ),
      },
      {
        path: 'history',
        data: { shellTitle: 'Historial' },
        loadComponent: () =>
          import('./features/history/history.component').then(
            (m) => m.HistoryComponent,
          ),
      },
      {
        path: 'records',
        data: { shellTitle: 'Registros' },
        loadComponent: () =>
          import('./features/records/all-records.component').then(
            (m) => m.AllRecordsComponent,
          ),
      },
      {
        path: 'devices',
        data: { shellTitle: 'Dispositivos IoT' },
        loadComponent: () =>
          import('./features/devices/devices.component').then(
            (m) => m.DevicesComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
