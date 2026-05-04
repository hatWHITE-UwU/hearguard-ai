import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/api_client.dart';
import '../../core/theme/app_theme.dart';

// ─── Question model ────────────────────────────────────────────────────────────

class _Question {
  const _Question(this.text, this.options);
  final String text;
  final List<String> options;
}

const _questions = [
  _Question(
    '¿Con qué frecuencia tienes dificultad para entender conversaciones en lugares ruidosos?',
    ['Nunca', 'Pocas veces', 'A menudo', 'Siempre'],
  ),
  _Question(
    '¿Usas audífonos o auriculares con frecuencia?',
    ['Nunca', 'Menos de 1 h/día', '1–3 h/día', 'Más de 3 h/día'],
  ),
  _Question(
    '¿Con qué frecuencia te expones a ambientes muy ruidosos (conciertos, maquinaria, etc.)?',
    ['Nunca', 'Raramente', 'A veces', 'Frecuentemente'],
  ),
  _Question(
    '¿Escuchas pitidos o zumbidos en los oídos (tinnitus)?',
    ['Nunca', 'Ocasionalmente', 'Con frecuencia', 'Casi siempre'],
  ),
  _Question(
    '¿Sueles subir el volumen de la TV o el teléfono más que otros?',
    ['Nunca', 'Pocas veces', 'A menudo', 'Siempre'],
  ),
  _Question(
    '¿Usas protección auditiva en entornos ruidosos?',
    ['Siempre', 'A veces', 'Raramente', 'Nunca'],
  ),
  _Question(
    '¿Cuántos años llevas expuesto a ambientes ruidosos laboralmente?',
    ['Ninguno', 'Menos de 5', 'Entre 5 y 15', 'Más de 15'],
  ),
  _Question(
    '¿Tienes familiares con pérdida auditiva?',
    ['No', 'Un familiar', 'Varios familiares', 'Casi todos'],
  ),
];

// ─── Screen ────────────────────────────────────────────────────────────────────

class HearingScreen extends StatefulWidget {
  const HearingScreen({super.key});

  @override
  State<HearingScreen> createState() => _HearingScreenState();
}

class _HearingScreenState extends State<HearingScreen> {
  int _step = 0;
  final _answers = <int>[];
  bool _submitting = false;

  double get _progress => _answers.length / _questions.length;

  void _answer(int idx) {
    setState(() => _answers.add(idx));
    if (_answers.length < _questions.length) {
      setState(() => _step++);
    } else {
      _submit();
    }
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);
    try {
      final api = context.read<ApiClient>();

      // Map questionnaire answers to habitData fields
      final habitData = {
        'headphoneHours': [0.0, 0.5, 2.0, 4.0][_answers[1]],
        'noiseExposure':  [0.0, 0.5, 1.5, 2.0][_answers[2]],
        'volumeLevel':    [40.0, 55.0, 70.0, 85.0][_answers[4]],
        'occupationRisk': [0.0, 1.0, 2.0, 3.0][_answers[5]],
        'smoking':        [0.0, 0.5, 1.5, 2.0][_answers[7]],
      };

      // Derive audiometric frequency scores from auditory difficulty indicators
      final difficulty = [0.0, 0.5, 1.5, 3.0][_answers[0]];
      final tinnitus   = [0.0, 0.0, 0.5, 1.0][_answers[3]];
      final volRisk    = [0.0, 0.2, 0.5, 1.0][_answers[4]];
      final yearsRisk  = [0.0, 0.3, 0.7, 1.5][_answers[6]];

      final freqDefs = [
        (250,  difficulty + yearsRisk * 0.5),
        (500,  difficulty + yearsRisk * 0.7),
        (1000, difficulty * 0.8 + volRisk + yearsRisk),
        (2000, difficulty * 0.7 + volRisk + yearsRisk + tinnitus * 0.5),
        (4000, difficulty * 0.5 + volRisk * 1.5 + yearsRisk * 1.2 + tinnitus),
        (8000, difficulty * 0.3 + volRisk * 1.5 + yearsRisk * 1.5 + tinnitus * 1.5),
      ];

      final frequencyScores = freqDefs.map((fd) => {
        'hz': fd.$1,
        'score': double.parse(((9.0 - fd.$2).clamp(0.0, 10.0)).toStringAsFixed(1)),
        'ear': 'both',
      }).toList();

      final res = await api.post('/api/evaluations', data: {
        'frequencyScores': frequencyScores,
        'habitData': habitData,
      });

      final score = (res['data']?['evaluation']?['overallScore'] as num?)?.toStringAsFixed(1);
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/shell');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(score != null ? 'Evaluación completada — score: $score' : 'Evaluación completada'),
            backgroundColor: AppTheme.success,
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No se pudo enviar la evaluación'), backgroundColor: AppTheme.danger),
        );
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final q = _questions[_step];
    final isDone = _submitting;

    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: const Text('Prueba auditiva'),
        leading: _step == 0
            ? null
            : IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => setState(() { _step--; _answers.removeLast(); }),
              ),
      ),
      body: isDone
          ? const Center(child: CircularProgressIndicator(color: AppTheme.accentCyan))
          : Column(
              children: [
                // Progress bar
                Container(
                  color: AppTheme.bgPrimary,
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Pregunta ${_step + 1} de ${_questions.length}',
                            style: const TextStyle(color: AppTheme.textMuted2, fontSize: 12),
                          ),
                          Text(
                            '${(_progress * 100).toInt()}%',
                            style: const TextStyle(color: AppTheme.accentCyan, fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: _progress,
                          backgroundColor: AppTheme.bgCard2,
                          color: AppTheme.accentCyan,
                          minHeight: 6,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Question
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppTheme.bgCard,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.border),
                        ),
                        child: Column(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: AppTheme.accentCyan.withOpacity(0.1),
                                shape: BoxShape.circle,
                                border: Border.all(color: AppTheme.accentCyan.withOpacity(0.4)),
                              ),
                              child: const Icon(Icons.hearing, color: AppTheme.accentCyan, size: 22),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              q.text,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                color: AppTheme.textPrimary,
                                fontSize: 15,
                                fontWeight: FontWeight.w500,
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Options
                      ...List.generate(q.options.length, (i) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: _OptionButton(
                            label: q.options[i],
                            index: i,
                            total: q.options.length,
                            onTap: () => _answer(i),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}

class _OptionButton extends StatelessWidget {
  const _OptionButton({required this.label, required this.index, required this.total, required this.onTap});
  final String label;
  final int index, total;
  final VoidCallback onTap;

  Color get _borderColor {
    final fraction = index / (total - 1);
    if (fraction < 0.34) return AppTheme.success;
    if (fraction < 0.67) return AppTheme.warning;
    return AppTheme.danger;
  }

  @override
  Widget build(BuildContext context) => Material(
        color: AppTheme.bgCard,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: onTap,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(color: _borderColor, shape: BoxShape.circle),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    label,
                    style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                ),
                const Icon(Icons.chevron_right, color: AppTheme.textMuted2, size: 18),
              ],
            ),
          ),
        ),
      );
}
