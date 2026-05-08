import 'dart:async';
import 'package:flutter/material.dart';
import 'package:noise_meter/noise_meter.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';
import '../../core/services/api_client.dart';
import '../../core/theme/app_theme.dart';

class MonitorScreen extends StatefulWidget {
  const MonitorScreen({super.key});

  @override
  State<MonitorScreen> createState() => _MonitorScreenState();
}

class _MonitorScreenState extends State<MonitorScreen> {
  double _db = 0;
  final _history = <double>[];
  bool _saving = false;
  bool _listening = false;
  bool _permissionDenied = false;

  final NoiseMeter _noiseMeter = NoiseMeter();
  StreamSubscription<NoiseReading>? _subscription;

  ({String tag, Color color}) get _risk {
    if (_db < 55) return (tag: 'Bajo', color: AppTheme.success);
    if (_db < 75) return (tag: 'Moderado', color: AppTheme.warning);
    if (_db < 95) return (tag: 'Alto', color: const Color(0xFFFF8C00));
    return (tag: 'Muy alto', color: AppTheme.danger);
  }

  @override
  void initState() {
    super.initState();
    _startListening();
  }

  Future<void> _startListening() async {
    final status = await Permission.microphone.request();
    if (!status.isGranted) {
      if (mounted) setState(() => _permissionDenied = true);
      return;
    }
    _subscription = _noiseMeter.noiseStream.listen(
      _onNoise,
      onError: (_) => _stopListening(),
    );
    if (mounted) setState(() => _listening = true);
  }

  void _onNoise(NoiseReading reading) {
    if (!mounted) return;
    final db = reading.meanDecibel.clamp(20.0, 120.0);
    setState(() {
      _db = db;
      _history.add(db);
      if (_history.length > 60) _history.removeAt(0);
    });
  }

  Future<void> _stopListening() async {
    await _subscription?.cancel();
    _subscription = null;
    if (mounted) setState(() => _listening = false);
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  Future<void> _saveReading() async {
    if (_saving || _db == 0) return;
    setState(() => _saving = true);
    try {
      final api = context.read<ApiClient>();
      await api.post('/api/noise', data: {'dbLevel': _db.round(), 'source': 'app'});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Lectura guardada'),
            backgroundColor: AppTheme.success,
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No se pudo guardar'),
            backgroundColor: AppTheme.danger,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_permissionDenied) return _PermissionDeniedView(onRetry: _startListening);

    final risk = _listening && _db > 0 ? _risk : null;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Estado del micrófono
        _StatusBanner(listening: _listening),
        const SizedBox(height: 20),

        // Medidor principal
        Card(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              children: [
                const Text(
                  'NIVEL SONORO',
                  style: TextStyle(
                    color: AppTheme.textMuted2,
                    fontSize: 11,
                    letterSpacing: 1.5,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 16),
                _listening && _db > 0
                    ? RichText(
                        text: TextSpan(
                          style: TextStyle(
                            fontSize: 72,
                            fontWeight: FontWeight.w700,
                            color: risk!.color,
                            height: 1,
                          ),
                          children: [
                            TextSpan(text: _db.toStringAsFixed(0)),
                            const TextSpan(
                              text: ' dB',
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      )
                    : const SizedBox(
                        height: 72,
                        child: Center(
                          child: CircularProgressIndicator(
                            color: AppTheme.accentCyan,
                            strokeWidth: 2,
                          ),
                        ),
                      ),
                if (risk != null) ...[
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: risk.color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: risk.color.withOpacity(0.4)),
                    ),
                    child: Text(
                      risk.tag,
                      style: TextStyle(
                        color: risk.color,
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Historial en barras
        if (_history.isNotEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Historial (${_history.length} muestras)',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    height: 80,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: _history.map((v) {
                        final frac = ((v - 20) / 100).clamp(0.04, 1.0);
                        Color barColor = AppTheme.success;
                        if (v >= 95) {
                          barColor = AppTheme.danger;
                        } else if (v >= 75) {
                          barColor = const Color(0xFFFF8C00);
                        } else if (v >= 55) {
                          barColor = AppTheme.warning;
                        }
                        return Expanded(
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 1),
                            height: 80 * frac,
                            decoration: BoxDecoration(
                              color: barColor.withOpacity(0.75),
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
                const Text(
                  'Referencia OMS',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 10),
                const _RiskRow(label: '< 55 dB', desc: 'Bajo — exposición segura', color: AppTheme.success),
                const _RiskRow(label: '55–75 dB', desc: 'Moderado — precaución', color: AppTheme.warning),
                const _RiskRow(label: '75–95 dB', desc: 'Alto — limita la exposición', color: Color(0xFFFF8C00)),
                const _RiskRow(label: '> 95 dB', desc: 'Muy alto — riesgo auditivo', color: AppTheme.danger),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),

        ElevatedButton.icon(
          onPressed: (_saving || _db == 0) ? null : _saveReading,
          icon: _saving
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                )
              : const Icon(Icons.save_alt, size: 20),
          label: Text(_saving ? 'Guardando…' : 'Guardar lectura actual'),
        ),
      ],
    );
  }
}

class _StatusBanner extends StatelessWidget {
  const _StatusBanner({required this.listening});
  final bool listening;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: listening
              ? AppTheme.success.withOpacity(0.08)
              : AppTheme.accentCyan.withOpacity(0.06),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: listening
                ? AppTheme.success.withOpacity(0.3)
                : AppTheme.accentCyan.withOpacity(0.2),
          ),
        ),
        child: Row(
          children: [
            Icon(
              listening ? Icons.mic : Icons.mic_none,
              color: listening ? AppTheme.success : AppTheme.textMuted,
              size: 18,
            ),
            const SizedBox(width: 10),
            Text(
              listening ? 'Micrófono activo — lectura en tiempo real' : 'Iniciando micrófono…',
              style: TextStyle(
                color: listening ? AppTheme.success : AppTheme.textMuted,
                fontSize: 12,
                height: 1.4,
              ),
            ),
          ],
        ),
      );
}

class _PermissionDeniedView extends StatelessWidget {
  const _PermissionDeniedView({required this.onRetry});
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.mic_off, size: 56, color: AppTheme.textMuted),
              const SizedBox(height: 20),
              const Text(
                'Permiso de micrófono denegado',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'HearGuard necesita acceso al micrófono para medir el nivel de ruido en tiempo real.',
                style: TextStyle(fontSize: 13, color: AppTheme.textMuted, height: 1.5),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.settings, size: 18),
                label: const Text('Conceder permiso'),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => openAppSettings(),
                child: const Text(
                  'Abrir ajustes del sistema',
                  style: TextStyle(color: AppTheme.accentCyan, fontSize: 13),
                ),
              ),
            ],
          ),
        ),
      );
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
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            ),
            const SizedBox(width: 10),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                desc,
                style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
              ),
            ),
          ],
        ),
      );
}
