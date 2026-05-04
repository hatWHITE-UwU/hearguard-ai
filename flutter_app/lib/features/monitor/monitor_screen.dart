import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/api_client.dart';
import '../../core/theme/app_theme.dart';

class MonitorScreen extends StatefulWidget {
  const MonitorScreen({super.key});

  @override
  State<MonitorScreen> createState() => _MonitorScreenState();
}

class _MonitorScreenState extends State<MonitorScreen> {
  // Simulación de valores (sustituir por noise_meter cuando se integre el hardware)
  double _db = 42;
  Timer? _timer;
  final _history = <double>[];
  bool _saving = false;

  ({String tag, Color color}) get _risk {
    if (_db < 55) return (tag: 'Bajo', color: AppTheme.success);
    if (_db < 75) return (tag: 'Moderado', color: AppTheme.warning);
    if (_db < 95) return (tag: 'Alto', color: const Color(0xFFFF8C00));
    return (tag: 'Muy alto', color: AppTheme.danger);
  }

  @override
  void initState() {
    super.initState();
    // Simulación: actualiza cada segundo con un valor ligeramente variable
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() {
        _db = (_db + (Random().nextDouble() * 6 - 3)).clamp(30, 110);
        _history.add(_db);
        if (_history.length > 30) _history.removeAt(0);
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _saveReading() async {
    if (_saving) return;
    setState(() => _saving = true);
    try {
      final api = context.read<ApiClient>();
      await api.post('/api/noise', data: {'dbLevel': _db.round(), 'source': 'app'});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lectura guardada'), backgroundColor: AppTheme.success),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No se pudo guardar'), backgroundColor: AppTheme.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final risk = _risk;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Banner informativo
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: AppTheme.accentPurple.withOpacity(0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.accentPurple.withOpacity(0.3)),
          ),
          child: Row(
            children: [
              const Icon(Icons.info_outline, color: AppTheme.accentPurple, size: 18),
              const SizedBox(width: 10),
              const Expanded(
                child: Text(
                  'Valores simulados. Conecta un dispositivo IoT para lecturas reales.',
                  style: TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.4),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Medidor principal
        Card(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              children: [
                const Text('🎤 Nivel sonoro', style: TextStyle(color: AppTheme.textMuted2, fontSize: 12, letterSpacing: 1.2)),
                const SizedBox(height: 16),
                RichText(
                  text: TextSpan(
                    style: TextStyle(fontSize: 72, fontWeight: FontWeight.w700, color: risk.color, height: 1),
                    children: [
                      TextSpan(text: _db.toStringAsFixed(0)),
                      const TextSpan(text: ' dB', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
                  decoration: BoxDecoration(
                    color: risk.color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: risk.color.withOpacity(0.4)),
                  ),
                  child: Text(risk.tag, style: TextStyle(color: risk.color, fontWeight: FontWeight.w700, fontSize: 13, letterSpacing: 0.8)),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Mini gráfico de barras (historial)
        if (_history.isNotEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Historial (últimas muestras)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                  const SizedBox(height: 14),
                  SizedBox(
                    height: 80,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: _history.map((v) {
                        final frac = ((v - 30) / 80).clamp(0.05, 1.0);
                        return Expanded(
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 1),
                            height: 80 * frac,
                            decoration: BoxDecoration(
                              color: AppTheme.accentCyan.withOpacity(0.7),
                              borderRadius: BorderRadius.circular(3),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        const SizedBox(height: 16),

        // Referencia OMS
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Referencia OMS', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                const SizedBox(height: 10),
                _RiskRow(label: '< 55 dB', desc: 'Bajo — exposición segura', color: AppTheme.success),
                _RiskRow(label: '55–75 dB', desc: 'Moderado — precaución', color: AppTheme.warning),
                _RiskRow(label: '75–95 dB', desc: 'Alto — limita la exposición', color: const Color(0xFFFF8C00)),
                _RiskRow(label: '> 95 dB', desc: 'Muy alto — riesgo auditivo', color: AppTheme.danger),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),

        ElevatedButton.icon(
          onPressed: _saving ? null : _saveReading,
          icon: _saving
              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
              : const Icon(Icons.save_alt, size: 20),
          label: Text(_saving ? 'Guardando…' : 'Guardar lectura actual'),
        ),
      ],
    );
  }
}

class _RiskRow extends StatelessWidget {
  const _RiskRow({required this.label, required this.desc, required this.color});
  final String label, desc;
  final Color color;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
            const SizedBox(width: 10),
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
            const SizedBox(width: 8),
            Expanded(child: Text(desc, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted))),
          ],
        ),
      );
}
