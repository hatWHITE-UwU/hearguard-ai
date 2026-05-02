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
    <div class="shell">
      @if (menuOpen()) {
        <div
          class="drawer-backdrop"
          role="presentation"
          (click)="closeMenu()"
        ></div>
        <aside
          class="drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          <p class="drawer-brand">HearGuard AI</p>
          <nav class="drawer-nav">
            <a routerLink="/app/dashboard" (click)="closeMenu()">Dashboard</a>
            <a routerLink="/app/records" (click)="closeMenu()">Registros</a>
            <a routerLink="/app/history" (click)="closeMenu()">Historial</a>
            <a routerLink="/app/recommendations" (click)="closeMenu()"
              >Recomendaciones</a
            >
            <a routerLink="/app/profile" (click)="closeMenu()">Perfil</a>
            <a routerLink="/app/monitor" (click)="closeMenu()">Monitoreo</a>
          </nav>
        </aside>
      }

      <header class="app-header">
        <div class="header-inner toolbar">
          <button
            type="button"
            class="icon-btn"
            aria-label="Abrir menú"
            [attr.aria-expanded]="menuOpen()"
            (click)="toggleMenu()"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
            </svg>
          </button>
          <h1 class="toolbar-title">{{ shellTitle() || 'HearGuard' }}</h1>
          <button
            type="button"
            class="icon-btn notif-btn"
            aria-label="Notificaciones"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M12 3a5 5 0 00-5 5v2.09a7 7 0 01-1.35 4.15L5 15h14l-.65-1.76A7 7 0 0117 10.09V8a5 5 0 00-5-5z" stroke-linejoin="round" />
              <path d="M9 18h6a3 3 0 01-6 0z" stroke-linejoin="round" />
            </svg>
            <span class="notif-badge" aria-hidden="true"></span>
          </button>
        </div>
      </header>
      <main class="main">
        <router-outlet />
      </main>
      <nav class="nav" aria-label="Navegación principal">
        <a
          routerLink="/app/dashboard"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
        >
          Inicio
        </a>
        <a routerLink="/app/records" routerLinkActive="active">Registros</a>
        <a routerLink="/app/history" routerLinkActive="active">Historial</a>
        <a routerLink="/app/recommendations" routerLinkActive="active"
          >Consejos</a
        >
        <a routerLink="/app/profile" routerLinkActive="active">Perfil</a>
      </nav>
    </div>
  `,
  styles: `
    .shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-primary);
    }

    .app-header {
      position: sticky;
      top: 0;
      z-index: 10;
      flex-shrink: 0;
      border-bottom: 1px solid var(--border);
      background: rgba(21, 29, 30, 0.82);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .header-inner {
      max-width: 720px;
      margin: 0 auto;
      padding: var(--space-sm) var(--space-gutter);
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .toolbar-title {
      flex: 1;
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      text-align: center;
      color: var(--text-primary);
      line-height: 1.2;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .icon-btn {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
      font-family: inherit;
    }

    .icon-btn:focus-visible {
      outline: 2px solid var(--accent-cyan);
      outline-offset: 2px;
    }

    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .notif-btn {
      position: relative;
    }

    .notif-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-purple);
      border: 2px solid var(--bg-primary);
    }

    .drawer-backdrop {
      position: fixed;
      inset: 0;
      z-index: 40;
      background: rgba(0, 0, 0, 0.45);
    }

    .drawer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 41;
      width: min(280px, 85vw);
      padding: var(--space-lg) var(--space-gutter);
      background: var(--bg-card2);
      border-right: 1px solid var(--border);
      box-shadow: 8px 0 32px rgba(0, 0, 0, 0.35);
    }

    .drawer-brand {
      margin: 0 0 var(--space-md);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent-cyan);
    }

    .drawer-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .drawer-nav a {
      padding: 12px 10px;
      border-radius: 10px;
      color: var(--text-primary);
      text-decoration: none;
      font-size: 0.92rem;
      font-weight: 500;
    }

    .drawer-nav a:hover {
      background: rgba(0, 229, 255, 0.08);
    }

    .drawer-nav a:focus-visible {
      outline: 2px solid var(--accent-cyan);
      outline-offset: 1px;
    }

    .main {
      flex: 1;
      width: 100%;
      max-width: 720px;
      margin: 0 auto;
      padding-bottom: 72px;
    }

    .nav {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 20;
      display: flex;
      justify-content: space-around;
      align-items: stretch;
      gap: 2px;
      padding: 6px var(--space-xs) calc(8px + env(safe-area-inset-bottom, 0));
      background: rgba(21, 29, 30, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-top: 1px solid var(--border);
    }

    .nav a {
      flex: 1;
      min-width: 0;
      text-align: center;
      padding: 8px 4px;
      font-size: 0.65rem;
      font-weight: 500;
      line-height: 1.2;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 10px;
      transition:
        color 0.15s ease,
        background 0.15s ease;
    }

    .nav a:focus-visible {
      outline: 2px solid var(--accent-cyan);
      outline-offset: 1px;
    }

    .nav a.active {
      color: var(--accent-cyan);
      font-weight: 600;
      background: rgba(0, 229, 255, 0.1);
    }
  `,
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
