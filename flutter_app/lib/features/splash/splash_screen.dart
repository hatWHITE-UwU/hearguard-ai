import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/api_client.dart';
import '../../core/models/user.dart';
import '../../core/theme/app_theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _scale;
  late Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 900));
    _scale = Tween(begin: 0.75, end: 1.0).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutBack));
    _fade  = Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeIn));
    _ctrl.forward();
    _resolve();
  }

  Future<void> _resolve() async {
    final auth = context.read<AuthService>();
    await auth.loadFromStorage();
    await Future.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;

    if (auth.accessToken != null) {
      try {
        final api = context.read<ApiClient>();
        final res = await api.get('/api/auth/me');
        final user = User.fromJson(res['data']['user'] as Map<String, dynamic>);
        await auth.updateUser(user);
        if (mounted) Navigator.pushReplacementNamed(context, '/shell');
      } catch (_) {
        await auth.logout();
        if (mounted) Navigator.pushReplacementNamed(context, '/login');
      }
    } else {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      body: Center(
        child: FadeTransition(
          opacity: _fade,
          child: ScaleTransition(
            scale: _scale,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 100, height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppTheme.accentCyan.withOpacity(0.1),
                    border: Border.all(color: AppTheme.accentCyan.withOpacity(0.4), width: 2),
                  ),
                  child: const Icon(Icons.hearing, size: 48, color: AppTheme.accentCyan),
                ),
                const SizedBox(height: 24),
                RichText(
                  text: const TextSpan(
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, letterSpacing: -0.5),
                    children: [
                      TextSpan(text: 'Hear', style: TextStyle(color: AppTheme.textPrimary)),
                      TextSpan(text: 'Guard', style: TextStyle(color: AppTheme.accentCyan)),
                      TextSpan(text: ' AI', style: TextStyle(color: AppTheme.accentPurple, fontSize: 22)),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Cuida tu audición, protege tu futuro',
                  style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                ),
                const SizedBox(height: 48),
                const SizedBox(
                  width: 24, height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppTheme.accentCyan,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
