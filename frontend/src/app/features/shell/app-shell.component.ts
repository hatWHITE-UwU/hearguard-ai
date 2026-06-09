import { Component, inject, OnInit, signal } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'hg-app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile backdrop -->
    @if (menuOpen()) {
      <div class="drawer-backdrop" role="presentation" (click)="closeMenu()"></div>
    }

    <div class="shell">
      <!-- Sidebar: overlay mobile / permanent desktop -->
      <aside class="sidebar" [class.sidebar--open]="menuOpen()" aria-label="Navegación">
        <div class="sidebar-brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true" style="color:var(--accent-cyan)">
            <path d="M3 18c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke-linecap="round"/>
            <path d="M7 18c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke-linecap="round"/>
            <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none"/>
          </svg>
          <span class="brand-name">HearGuard</span>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/app/dashboard" routerLinkActive="active"
             [routerLinkActiveOptions]="{exact:true}" class="sidebar-link" (click)="closeMenu()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path d="M3 12L12 3l9 9" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke-linejoin="round"/>
            </svg>
            <span>Inicio</span>
          </a>
          <a routerLink="/app/records" routerLinkActive="active" class="sidebar-link" (click)="closeMenu()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <path d="M14 17.5h7M17.5 14v7" stroke-linecap="round"/>
            </svg>
            <span>Registros</span>
          </a>
          <a routerLink="/app/history" routerLinkActive="active" class="sidebar-link" (click)="closeMenu()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Historial</span>
          </a>
          <a routerLink="/app/recommendations" routerLinkActive="active" class="sidebar-link" (click)="closeMenu()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path d="M12 2a7 7 0 00-4 12.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26A7 7 0 0012 2z" stroke-linejoin="round"/>
              <path d="M9 21h6" stroke-linecap="round"/>
            </svg>
            <span>Consejos</span>
          </a>
          <a routerLink="/app/monitor" routerLinkActive="active" class="sidebar-link" (click)="closeMenu()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path d="M2 12h2l3-7 4 14 3-10 2 3h6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Monitor</span>
          </a>
          <a routerLink="/app/devices" routerLinkActive="active" class="sidebar-link" (click)="closeMenu()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <rect x="4" y="4" width="16" height="16" rx="2"/>
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke-linecap="round"/>
            </svg>
            <span>Dispositivos</span>
          </a>
          <a routerLink="/app/profile" routerLinkActive="active" class="sidebar-link" (click)="closeMenu()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke-linecap="round"/>
            </svg>
            <span>Perfil</span>
          </a>
        </nav>
      </aside>

      <!-- Page content -->
      <div class="page-wrap">
        <header class="app-header">
          <div class="header-inner toolbar">
            <button type="button" class="icon-btn menu-btn" aria-label="Abrir menú"
              [attr.aria-expanded]="menuOpen()" (click)="toggleMenu()">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round"/>
              </svg>
            </button>
            <h1 class="toolbar-title">{{ shellTitle() || 'HearGuard' }}</h1>
            <button type="button" class="icon-btn notif-btn" aria-label="Notificaciones">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M12 3a5 5 0 00-5 5v2.09a7 7 0 01-1.35 4.15L5 15h14l-.65-1.76A7 7 0 0117 10.09V8a5 5 0 00-5-5z" stroke-linejoin="round"/>
                <path d="M9 18h6a3 3 0 01-6 0z" stroke-linejoin="round"/>
              </svg>
              <span class="notif-badge" aria-hidden="true"></span>
            </button>
          </div>
        </header>

        <main class="main">
          <router-outlet/>
        </main>

        <!-- Bottom nav — hidden on desktop -->
        <nav class="bottom-nav" aria-label="Navegación principal">
          <a routerLink="/app/dashboard" routerLinkActive="active"
             [routerLinkActiveOptions]="{exact:true}" class="bottom-link">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path d="M3 12L12 3l9 9" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke-linejoin="round"/>
            </svg>
            <span>Inicio</span>
          </a>
          <a routerLink="/app/records" routerLinkActive="active" class="bottom-link">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <path d="M14 17.5h7M17.5 14v7" stroke-linecap="round"/>
            </svg>
            <span>Registros</span>
          </a>
          <a routerLink="/app/history" routerLinkActive="active" class="bottom-link">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Historial</span>
          </a>
          <a routerLink="/app/recommendations" routerLinkActive="active" class="bottom-link">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path d="M12 2a7 7 0 00-4 12.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26A7 7 0 0012 2z" stroke-linejoin="round"/>
              <path d="M9 21h6" stroke-linecap="round"/>
            </svg>
            <span>Consejos</span>
          </a>
          <a routerLink="/app/profile" routerLinkActive="active" class="bottom-link">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke-linecap="round"/>
            </svg>
            <span>Perfil</span>
          </a>
        </nav>
      </div>
    </div>
  `,
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent implements OnInit {
  private readonly router = inject(Router);
  readonly shellTitle = signal('');
  readonly menuOpen = signal(false);

  ngOnInit(): void {
    this.updateTitle();
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.updateTitle();
        this.menuOpen.set(false);
      });
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  private updateTitle(): void {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const title = route.snapshot.data['shellTitle'];
    if (typeof title === 'string' && title.length > 0) {
      this.shellTitle.set(title);
    }
  }
}
