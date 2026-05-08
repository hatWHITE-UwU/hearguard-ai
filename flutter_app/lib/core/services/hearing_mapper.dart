// Maps 8 questionnaire answer indices (0=best, 3=worst) to the
// frequencyScores + habitData payload expected by POST /api/evaluations.
//
// Indices per question:
//   0 — difficulty understanding speech in noisy places
//   1 — headphone usage frequency
//   2 — noisy environment exposure
//   3 — tinnitus frequency
//   4 — volume level (TV / phone)
//   5 — hearing protection usage  (0=always → lowest risk)
//   6 — years of occupational noise exposure
//   7 — family history of hearing loss

const _kFrequencies = [250, 500, 1000, 2000, 4000, 8000];

class HearingMapper {
  HearingMapper._();

  /// Returns `{'frequencyScores': [...], 'habitData': {...}}`.
  static Map<String, dynamic> buildPayload(List<int> answers) {
    assert(answers.length == 8, 'Expected 8 answers, got ${answers.length}');

    final habitData = _buildHabitData(answers);
    final frequencyScores = _buildFrequencyScores(answers);

    return {
      'frequencyScores': frequencyScores,
      'habitData': habitData,
    };
  }

  static Map<String, dynamic> _buildHabitData(List<int> answers) => {
        'headphoneHours': [0.0, 0.5, 2.0, 4.0][answers[1]],
        'noiseExposure':  [0.0, 0.5, 1.5, 2.0][answers[2]],
        'volumeLevel':    [40.0, 55.0, 70.0, 85.0][answers[4]],
        'occupationRisk': [0.0, 1.0, 2.0, 3.0][answers[5]],
        'smoking':        [0.0, 0.5, 1.5, 2.0][answers[7]],
      };

  static List<Map<String, dynamic>> _buildFrequencyScores(List<int> answers) {
    final difficulty = [0.0, 0.5, 1.5, 3.0][answers[0]];
    final tinnitus   = [0.0, 0.0, 0.5, 1.0][answers[3]];
    final volRisk    = [0.0, 0.2, 0.5, 1.0][answers[4]];
    final yearsRisk  = [0.0, 0.3, 0.7, 1.5][answers[6]];

    // Deduction per frequency band — higher frequencies degrade first
    final deductions = [
      difficulty + yearsRisk * 0.5,
      difficulty + yearsRisk * 0.7,
      difficulty * 0.8 + volRisk + yearsRisk,
      difficulty * 0.7 + volRisk + yearsRisk + tinnitus * 0.5,
      difficulty * 0.5 + volRisk * 1.5 + yearsRisk * 1.2 + tinnitus,
      difficulty * 0.3 + volRisk * 1.5 + yearsRisk * 1.5 + tinnitus * 1.5,
    ];

    return List.generate(_kFrequencies.length, (i) {
      final score = (9.0 - deductions[i]).clamp(0.0, 10.0);
      return {
        'hz':    _kFrequencies[i],
        'score': double.parse(score.toStringAsFixed(1)),
        'ear':   'both',
      };
    });
  }
}
