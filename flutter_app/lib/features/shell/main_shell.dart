import 'package:flutter/material.dart';
import '../dashboard/dashboard_screen.dart';
import '../monitor/monitor_screen.dart';
import '../history/history_screen.dart';
import '../profile/profile_screen.dart';
import '../../core/theme/app_theme.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _idx = 0;
  late final List<Widget> _screens;

  static const _titles = ['Dashboard', 'Monitoreo', 'Historial', 'Perfil'];

  @override
  void initState() {
    super.initState();
    _screens = [
      DashboardScreen(onNavigate: _setTab),
      const MonitorScreen(),
      const HistoryScreen(),
      const ProfileScreen(),
    ];
  }

  void _setTab(int i) => setState(() => _idx = i);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: Text(_titles[_idx]),
        actions: [
          if (_idx == 0)
            IconButton(
              tooltip: 'Prueba auditiva',
              onPressed: () => Navigator.pushNamed(context, '/hearing'),
              icon: const Icon(Icons.graphic_eq, color: AppTheme.accentPurple),
            ),
        ],
      ),
      body: IndexedStack(index: _idx, children: _screens),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppTheme.border)),
        ),
        child: BottomNavigationBar(
          currentIndex: _idx,
          onTap: _setTab,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home_outlined),     activeIcon: Icon(Icons.home),      label: 'Inicio'),
            BottomNavigationBarItem(icon: Icon(Icons.bar_chart_outlined), activeIcon: Icon(Icons.bar_chart), label: 'Monitor'),
            BottomNavigationBarItem(icon: Icon(Icons.history_outlined),  activeIcon: Icon(Icons.history),   label: 'Historial'),
            BottomNavigationBarItem(icon: Icon(Icons.person_outline),    activeIcon: Icon(Icons.person),    label: 'Perfil'),
          ],
        ),
      ),
    );
  }
}
