import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class ResultsScreen extends StatelessWidget {
  const ResultsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final args = (ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?) ?? {};
    final evaluation    = args['evaluation']    as Map<String, dynamic>? ?? {};
    final riskResult    = args['riskResult']    as Map<String, dynamic>?;
    final recommendations = args['recommendations'] as List<dynamic>? ?? [];

    final riskScore   = (riskResult?['riskScore'] as num?)?.toDouble()
                        ?? ((10 - ((evaluation['overallScore'] as num?) ?? 5)) * 10).clamp(0, 100).toDouble();
    final riskLevel   = (riskResult?['riskLevel']  as String?) ?? _levelFromScore(riskScore);
    final years       = riskResult?['yearsEstimated'] as num?;
    final topFactors  = (riskResult?['topFactors'] as List<dynamic>?) ?? [];
    final recs        = recommendations.isNotEmpty
        ? recommendations
        : (riskResult?['recommendations'] as List<dynamic>?) ?? [];

    final color = _riskColor(riskScore);

    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: const Text('Resultado de evaluación'),
        automaticallyImplyLeading: false,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Score gauge ──────────────────────────────────────────────────
          Card(
            child: Padding(
              padding: const EdgeInsets.all(28),
              child: Column(
                children: [
                  const Text(
                    'Índice de riesgo auditivo',
                    style: TextStyle(fontSize: 12, letterSpacing: 0.8, color: AppTheme.textMuted2),
                  ),
                  const SizedBox(height: 20),
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 160, height: 160,
                        child: CircularProgressIndicator(
                          value: riskScore / 100,
                          strokeWidth: 12,
                          backgroundColor: AppTheme.bgCard2,
                          color: color,
                          strokeCap: StrokeCap.round,
                        ),
                      ),
                      Column(
                        children: [
                          Text(
                            riskScore.toStringAsFixed(0),
                            style: TextStyle(fontSize: 46, fontWeight: FontWeight.w800, color: color, height: 1),
                          ),
                          const Text('/ 100', style: TextStyle(color: AppTheme.textMuted2, fontSize: 13)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 7),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: color.withOpacity(0.45)),
                    ),
                    child: Text(
                      riskLevel,
                      style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 14, letterSpacing: 0.6),
                    ),
                  ),
                  if (years != null) ...[
                    const SizedBox(height: 14),
                    Text(
                      'Estimación: $years años de audición saludable restante',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.5),
                    ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // ── Top factors ──────────────────────────────────────────────────
          if (topFactors.isNotEmpty) ...[
            const _SectionLabel(label: 'Factores identificados'),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: topFactors.map((f) => _FactorRow(text: f.toString())).toList(),
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // ── Recommendations ──────────────────────────────────────────────
          if (recs.isNotEmpty) ...[
            const _SectionLabel(label: 'Recomendaciones personalizadas'),
            const SizedBox(height: 8),
            ...recs.asMap().entries.map((e) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: _RecCard(index: e.key + 1, text: e.value.toString(), color: color),
            )),
            const SizedBox(height: 8),
          ],

          // ── Disclaimer ───────────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: AppTheme.bgCard2,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.border),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.info_outline, size: 16, color: AppTheme.textMuted2),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Este resultado es una estimación orientativa, no un diagnóstico médico. Consulta a un audiólogo para una evaluación profesional.',
                    style: TextStyle(color: AppTheme.textMuted2, fontSize: 11, height: 1.5),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ── Actions ──────────────────────────────────────────────────────
          ElevatedButton(
            onPressed: () => Navigator.pushNamedAndRemoveUntil(context, '/shell', (_) => false),
            child: const Text('Volver al inicio'),
          ),
          const SizedBox(height: 10),
          OutlinedButton(
            onPressed: () => Navigator.pushNamedAndRemoveUntil(
              context, '/hearing', (r) => r.settings.name == '/shell',
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.accentPurple,
              side: BorderSide(color: AppTheme.accentPurple.withOpacity(0.5)),
              minimumSize: const Size(double.infinity, 52),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Repetir evaluación'),
          ),
        ],
      ),
    );
  }

  Color _riskColor(double score) {
    if (score < 30) return AppTheme.success;
    if (score < 60) return AppTheme.warning;
    if (score < 80) return const Color(0xFFFF8C00);
    return AppTheme.danger;
  }

  String _levelFromScore(double score) {
    if (score < 30) return 'Bajo';
    if (score < 60) return 'Moderado';
    if (score < 80) return 'Alto';
    return 'Muy Alto';
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  const _SectionLabel({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) => Text(
        label.toUpperCase(),
        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.8, color: AppTheme.textMuted2),
      );
}

class _FactorRow extends StatelessWidget {
  const _FactorRow({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 5),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.only(top: 5),
              child: Icon(Icons.warning_amber_rounded, size: 14, color: AppTheme.warning),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(text, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, height: 1.4)),
            ),
          ],
        ),
      );
}

class _RecCard extends StatelessWidget {
  const _RecCard({required this.index, required this.text, required this.color});
  final int index;
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppTheme.bgCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.border),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 26, height: 26,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
                border: Border.all(color: color.withOpacity(0.4)),
              ),
              child: Center(
                child: Text('$index', style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w700)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(text, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, height: 1.5)),
            ),
          ],
        ),
      );
}
