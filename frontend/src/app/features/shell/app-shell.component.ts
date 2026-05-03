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
  styles: `
    /* ── Base shell ── */
    .shell {
      display: flex;
      flex-direction: row;
      min-height: 100vh;
      background: var(--bg-primary);
    }

    /* ── Backdrop (mobile) ── */
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      z-index: 40;
      background: rgba(0, 0, 0, 0.5);
    }

    /* ── Sidebar ── */
    .sidebar {
      position: fixed;
      top: 0; left: 0; bottom: 0;
      z-index: 41;
      width: min(260px, 85vw);
      display: flex;
      flex-direction: column;
      padding: var(--space-lg) var(--space-gutter);
      background: var(--bg-card);
      border-right: 1px solid var(--border);
      box-shadow: 8px 0 32px rgba(0, 0, 0, 0.4);
      transform: translateX(-100%);
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
    }

    .sidebar--open {
      transform: translateX(0);
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: var(--space-lg);
      padding-bottom: var(--space-md);
      border-bottom: 1px solid var(--border);
    }

    .brand-name {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 10px;
      border-radius: 10px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.15s, background 0.15s;
    }

    .sidebar-link svg { flex-shrink: 0; opacity: 0.65; transition: opacity 0.15s; }

    .sidebar-link:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.05);
    }
    .sidebar-link:hover svg { opacity: 1; }

    .sidebar-link.active {
      color: var(--accent-cyan);
      background: rgba(0, 229, 255, 0.1);
      font-weight: 600;
    }
    .sidebar-link.active svg { opacity: 1; }

    .sidebar-link:focus-visible {
      outline: 2px solid var(--accent-cyan);
      outline-offset: 1px;
    }

    /* ── Page wrap ── */
    .page-wrap {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    /* ── Header ── */
    .app-header {
      position: sticky;
      top: 0;
      z-index: 10;
      flex-shrink: 0;
      border-bottom: 1px solid var(--border);
      background: rgba(21, 29, 30, 0.88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .header-inner {
      max-width: 1000px;
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
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .icon-btn {
      flex-shrink: 0;
      width: 40px; height: 40px;
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
    .icon-btn:hover { background: rgba(255, 255, 255, 0.06); }
    .icon-btn:focus-visible { outline: 2px solid var(--accent-cyan); outline-offset: 2px; }

    .notif-btn { position: relative; }
    .notif-badge {
      position: absolute;
      top: 8px; right: 8px;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--accent-purple);
      border: 2px solid var(--bg-primary);
    }

    /* ── Main ── */
    .main {
      flex: 1;
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
      padding-bottom: 76px;
    }

    /* ── Bottom nav (mobile) ── */
    .bottom-nav {
      position: fixed;
      left: 0; right: 0; bottom: 0;
      z-index: 20;
      display: flex;
      justify-content: space-around;
      align-items: stretch;
      padding: 6px var(--space-xs) calc(8px + env(safe-area-inset-bottom, 0));
      background: rgba(13, 21, 22, 0.97);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-top: 1px solid var(--border);
    }

    .bottom-link {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 6px 2px;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 8px;
      font-size: 0.6rem;
      font-weight: 500;
      line-height: 1.2;
      transition: color 0.15s;
    }
    .bottom-link.active { color: var(--accent-cyan); }
    .bottom-link:focus-visible { outline: 2px solid var(--accent-cyan); outline-offset: 1px; }

    /* ── Tablet / Desktop (≥768px) ── */
    @media (min-width: 768px) {
      .sidebar {
        position: sticky;
        top: 0;
        height: 100vh;
        width: 220px;
        flex-shrink: 0;
        transform: none;
        box-shadow: none;
      }

      .menu-btn { display: none; }

      .bottom-nav { display: none; }

      .main { padding-bottom: var(--space-xl); }

      .toolbar-title { text-align: left; }
    }

    /* ── Large desktop (≥1200px) ── */
    @media (min-width: 1200px) {
      .sidebar { width: 240px; }
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
