import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/services/api_client.dart';
import '../../core/theme/app_theme.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> with SingleTickerProviderStateMixin {
  late TabController _tab;
  List<dynamic> _noise = [];
  List<dynamic> _evals = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 2, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final api = context.read<ApiClient>();
    try {
      final nr = await api.get('/api/noise', params: {'limit': '50'});
      _noise = (nr['data']?['items'] as List?) ?? [];
    } catch (_) {}
    try {
      final er = await api.get('/api/evaluations', params: {'limit': '50'});
      _evals = (er['data']?['items'] as List?) ?? [];
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          color: AppTheme.bgPrimary,
          child: TabBar(
            controller: _tab,
            indicatorColor: AppTheme.accentCyan,
            labelColor: AppTheme.accentCyan,
            unselectedLabelColor: AppTheme.textMuted2,
            tabs: const [
              Tab(text: 'Ruido'),
              Tab(text: 'Evaluaciones'),
            ],
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator(color: AppTheme.accentCyan))
              : TabBarView(
                  controller: _tab,
                  children: [
                    _NoiseTab(items: _noise, onRefresh: _load),
                    _EvalTab(items: _evals, onRefresh: _load),
                  ],
                ),
        ),
      ],
    );
  }
}

class _NoiseTab extends StatelessWidget {
  const _NoiseTab({required this.items, required this.onRefresh});
  final List<dynamic> items;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) => RefreshIndicator(
        color: AppTheme.accentCyan,
        backgroundColor: AppTheme.bgCard,
        onRefresh: onRefresh,
        child: items.isEmpty
            ? const _EmptyState(msg: 'Sin registros de ruido.', icon: Icons.volume_off)
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: items.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (_, i) {
                  final n = items[i] as Map<String, dynamic>;
                  final db = n['dbLevel'] as num?;
                  final tag = n['riskTag'] as String? ?? '';
                  final at  = n['recordedAt'] as String?;
                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('${db ?? '—'} dB', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.accentCyan)),
                                const SizedBox(height: 2),
                                Text(at != null ? DateFormat('d MMM y, HH:mm', 'es').format(DateTime.parse(at).toLocal()) : '—',
                                    style: const TextStyle(color: AppTheme.textMuted2, fontSize: 12)),
                              ],
                            ),
                          ),
                          _RiskBadge(tag: tag),
                        ],
                      ),
                    ),
                  );
                },
              ),
      );
}

class _EvalTab extends StatelessWidget {
  const _EvalTab({required this.items, required this.onRefresh});
  final List<dynamic> items;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) => RefreshIndicator(
        color: AppTheme.accentCyan,
        backgroundColor: AppTheme.bgCard,
        onRefresh: onRefresh,
        child: items.isEmpty
            ? const _EmptyState(msg: 'Sin evaluaciones todavía.', icon: Icons.hearing_disabled)
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: items.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (_, i) {
                  final e = items[i] as Map<String, dynamic>;
                  final score  = e['overallScore'] as num?;
                  final status = e['status'] as String? ?? '';
                  final at     = e['takenAt'] as String?;
                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Row(
                        children: [
                          Container(
                            width: 48, height: 48,
                            decoration: BoxDecoration(
                              color: AppTheme.accentPurple.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.accentPurple.withOpacity(0.3)),
                            ),
                            child: Center(
                              child: Text(
                                score != null ? score.toStringAsFixed(1) : '—',
                                style: const TextStyle(color: AppTheme.accentPurple, fontWeight: FontWeight.w700, fontSize: 15),
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Evaluación auditiva', style: const TextStyle(fontWeight: FontWeight.w600, color: AppTheme.textPrimary, fontSize: 14)),
                                const SizedBox(height: 2),
                                Text(at != null ? DateFormat('d MMM y', 'es').format(DateTime.parse(at).toLocal()) : '—',
                                    style: const TextStyle(color: AppTheme.textMuted2, fontSize: 12)),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                            decoration: BoxDecoration(
                              color: status == 'complete' ? AppTheme.success.withOpacity(0.1) : AppTheme.warning.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(color: status == 'complete' ? AppTheme.success.withOpacity(0.4) : AppTheme.warning.withOpacity(0.4)),
                            ),
                            child: Text(
                              status == 'complete' ? 'Completa' : 'Parcial',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: status == 'complete' ? AppTheme.success : AppTheme.warning),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      );
}

class _RiskBadge extends StatelessWidget {
  const _RiskBadge({required this.tag});
  final String tag;

  Color get _color {
    switch (tag) {
      case 'bajo': return AppTheme.success;
      case 'moderado': return AppTheme.warning;
      case 'alto': return const Color(0xFFFF8C00);
      case 'muy_alto': return AppTheme.danger;
      default: return AppTheme.textMuted2;
    }
  }

  String get _label => tag.replaceAll('_', ' ');

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: _color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: _color.withOpacity(0.4)),
        ),
        child: Text(_label, style: TextStyle(color: _color, fontWeight: FontWeight.w600, fontSize: 11)),
      );
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.msg, required this.icon});
  final String msg;
  final IconData icon;

  @override
  Widget build(BuildContext context) => ListView(
        children: [
          SizedBox(
            height: 300,
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(icon, size: 48, color: AppTheme.textMuted2),
                  const SizedBox(height: 16),
                  Text(msg, style: const TextStyle(color: AppTheme.textMuted, fontSize: 14)),
                ],
              ),
            ),
          ),
        ],
      );
}
