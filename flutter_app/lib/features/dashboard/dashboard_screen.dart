import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/api_client.dart';
import '../../core/theme/app_theme.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key, this.onNavigate});
  final void Function(int tab)? onNavigate;

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  double _riskScore = 0;
  String _riskLabel = '—';
  double _avgNoise  = 0;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = context.read<ApiClient>();
    try {
      final evRes = await api.get('/api/evaluations', params: {'limit': '1'});
      final first = (evRes['data']?['items'] as List?)?.firstOrNull;
      if (first != null && first['overallScore'] != null) {
        setState(() {
          _riskScore = ((10 - (first['overallScore'] as num)) * 10).clamp(0, 100).toDouble();
          _riskLabel = 'Estimación';
        });
      }
    } catch (_) {}
    try {
      final nRes = await api.get('/api/noise/stats/today');
      final avg = nRes['data']?['avgDb'];
      if (avg != null) setState(() => _avgNoise = (avg as num).toDouble());
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Color _riskColor(double score) {
    if (score < 30) return AppTheme.success;
    if (score < 60) return AppTheme.warning;
    return AppTheme.danger;
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final name = auth.user?.firstName ?? 'usuario';

    return RefreshIndicator(
      color: AppTheme.accentCyan,
      backgroundColor: AppTheme.bgCard,
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Saludo
          Text('Hola, $name', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
          const SizedBox(height: 2),
          const Text('Resumen de tu salud auditiva', style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          const SizedBox(height: 20),

          // Riesgo
          _SectionLabel(label: 'Nivel de riesgo actual', hint: 'Basado en tu última evaluación'),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: _loading
                  ? const Center(child: CircularProgressIndicator(color: AppTheme.accentCyan))
                  : Column(
                      children: [
                        Stack(
                          alignment: Alignment.center,
                          children: [
                            SizedBox(
                              width: 140, height: 140,
                              child: CircularProgressIndicator(
                                value: _riskScore / 100,
                                strokeWidth: 10,
                                backgroundColor: AppTheme.bgCard2,
                                color: _riskColor(_riskScore),
                              ),
                            ),
                            Column(
                              children: [
                                Text(
                                  _riskScore.toStringAsFixed(0),
                                  style: TextStyle(fontSize: 36, fontWeight: FontWeight.w700, color: _riskColor(_riskScore)),
                                ),
                                const Text('/ 100', style: TextStyle(color: AppTheme.textMuted2, fontSize: 12)),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(_riskLabel, style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 20),

          // Ruido promedio
          _SectionLabel(label: 'Exposición al ruido hoy', hint: 'Promedio de decibelios del día'),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  const Icon(Icons.volume_up, color: AppTheme.accentCyan, size: 32),
                  const SizedBox(width: 16),
                  RichText(
                    text: TextSpan(
                      style: const TextStyle(color: AppTheme.accentCyan, fontSize: 36, fontWeight: FontWeight.w700),
                      children: [
                        TextSpan(text: _avgNoise > 0 ? _avgNoise.toStringAsFixed(0) : '—'),
                        const TextSpan(text: ' dB', style: TextStyle(fontSize: 16, color: AppTheme.textMuted)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Acciones rápidas
          _SectionLabel(label: 'Acciones rápidas', hint: 'Prueba auditiva, historial y perfil'),
          const SizedBox(height: 8),
          _QuickTile(
            icon: Icons.graphic_eq,
            color: AppTheme.accentCyan,
            title: 'Prueba auditiva',
            subtitle: 'Cuestionario y hábitos',
            onTap: () => Navigator.pushNamed(context, '/hearing'),
          ),
          const SizedBox(height: 8),
          _QuickTile(
            icon: Icons.bar_chart,
            color: AppTheme.accentPurple,
            title: 'Monitoreo en vivo',
            subtitle: 'Nivel de ruido actual',
            onTap: () => widget.onNavigate?.call(1),
          ),
          const SizedBox(height: 8),
          _QuickTile(
            icon: Icons.history,
            color: AppTheme.accentCyan,
            title: 'Historial',
            subtitle: 'Ruido y evaluaciones',
            onTap: () => widget.onNavigate?.call(2),
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel({required this.label, required this.hint});
  final String label, hint;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
          const SizedBox(height: 2),
          Text(hint, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted2)),
        ],
      );
}

class _QuickTile extends StatelessWidget {
  const _QuickTile({required this.icon, required this.color, required this.title, required this.subtitle, required this.onTap});
  final IconData icon;
  final Color color;
  final String title, subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Card(
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: color.withOpacity(0.3)),
                  ),
                  child: Icon(icon, color: color, size: 22),
                ),
                const SizedBox(width: 14),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                    const SizedBox(height: 2),
                    Text(subtitle, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                  ],
                ),
                const Spacer(),
                const Icon(Icons.chevron_right, color: AppTheme.textMuted2, size: 20),
              ],
            ),
          ),
        ),
      );
}
