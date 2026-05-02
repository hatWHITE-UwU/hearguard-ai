import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';

void main() {
  runApp(const HearGuardApp());
}

/// Esqueleto Fase 6: pantallas mínimas; amplía con Dio + flujos del backend.
class HearGuardApp extends StatelessWidget {
  const HearGuardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HearGuard AI',
      theme: AppTheme.dark,
      initialRoute: '/',
      routes: {
        '/': (_) => const _Placeholder('Splash'),
        '/login': (_) => const _Placeholder('Login'),
        '/register': (_) => const _Placeholder('Registro'),
        '/dashboard': (_) => const _Placeholder('Dashboard'),
        '/monitor': (_) => const _Placeholder('Monitoreo'),
        '/hearing': (_) => const _Placeholder('Prueba auditiva'),
        '/results': (_) => const _Placeholder('Resultados'),
        '/recommendations': (_) => const _Placeholder('Recomendaciones'),
        '/history': (_) => const _Placeholder('Historial'),
        '/profile': (_) => const _Placeholder('Perfil'),
      },
    );
  }
}

class _Placeholder extends StatelessWidget {
  const _Placeholder(this.title);
  final String title;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Text(
          'HearGuard — $title\n(Configura API con Dio y navegación completa)',
          textAlign: TextAlign.center,
          style: const TextStyle(color: AppTheme.textMuted),
        ),
      ),
    );
  }
}
