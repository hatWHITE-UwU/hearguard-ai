import 'package:flutter_test/flutter_test.dart';
import 'package:hearguard_app/core/services/hearing_mapper.dart';

// Helpers
const _bestProfile  = [0, 0, 0, 0, 0, 0, 0, 0]; // all best answers
const _worstProfile = [3, 3, 3, 3, 3, 3, 3, 3]; // all worst answers

List<Map<String, dynamic>> _freqScores(List<int> answers) =>
    (HearingMapper.buildPayload(answers)['frequencyScores'] as List)
        .cast<Map<String, dynamic>>();

Map<String, dynamic> _habitData(List<int> answers) =>
    HearingMapper.buildPayload(answers)['habitData'] as Map<String, dynamic>;

void main() {
  group('HearingMapper.buildPayload — structure', () {
    test('returns both frequencyScores and habitData keys', () {
      final p = HearingMapper.buildPayload(_bestProfile);
      expect(p.containsKey('frequencyScores'), isTrue);
      expect(p.containsKey('habitData'), isTrue);
    });

    test('frequencyScores contains exactly 6 entries', () {
      expect(_freqScores(_bestProfile), hasLength(6));
    });

    test('each frequency entry has hz, score, ear fields', () {
      for (final entry in _freqScores(_bestProfile)) {
        expect(entry.containsKey('hz'), isTrue);
        expect(entry.containsKey('score'), isTrue);
        expect(entry['ear'], 'both');
      }
    });

    test('hz values are the 6 standard audiometric frequencies', () {
      final hzList = _freqScores(_bestProfile).map((e) => e['hz']).toList();
      expect(hzList, [250, 500, 1000, 2000, 4000, 8000]);
    });

    test('all scores are in range 0–10', () {
      for (final answers in [_bestProfile, _worstProfile]) {
        for (final entry in _freqScores(answers)) {
          final s = entry['score'] as double;
          expect(s, inInclusiveRange(0.0, 10.0));
        }
      }
    });
  });

  group('HearingMapper.buildPayload — score direction', () {
    test('best profile scores are higher than worst profile scores', () {
      final best  = _freqScores(_bestProfile);
      final worst = _freqScores(_worstProfile);
      for (var i = 0; i < best.length; i++) {
        expect(
          (best[i]['score'] as double) >= (worst[i]['score'] as double),
          isTrue,
          reason: 'freq index $i: best should be ≥ worst',
        );
      }
    });

    test('worst profile has at least one score below 5', () {
      final scores = _freqScores(_worstProfile).map((e) => e['score'] as double);
      expect(scores.any((s) => s < 5.0), isTrue);
    });

    test('best profile has no score below 8', () {
      final scores = _freqScores(_bestProfile).map((e) => e['score'] as double);
      expect(scores.every((s) => s >= 8.0), isTrue);
    });

    test('high-frequency bands degrade more with tinnitus (Q3=3)', () {
      final noTinnitus = [0, 0, 0, 0, 0, 0, 0, 0];
      final withTinnitus = [0, 0, 0, 3, 0, 0, 0, 0];
      final s1 = _freqScores(noTinnitus);
      final s2 = _freqScores(withTinnitus);
      // 8000 Hz (index 5) should drop more than 250 Hz (index 0)
      final delta8k = (s1[5]['score'] as double) - (s2[5]['score'] as double);
      final delta250 = (s1[0]['score'] as double) - (s2[0]['score'] as double);
      expect(delta8k, greaterThan(delta250));
    });
  });

  group('HearingMapper.buildPayload — habitData values', () {
    test('headphoneHours maps correctly for each answer index', () {
      expect(_habitData([0, 0, 0, 0, 0, 0, 0, 0])['headphoneHours'], 0.0);
      expect(_habitData([0, 1, 0, 0, 0, 0, 0, 0])['headphoneHours'], 0.5);
      expect(_habitData([0, 2, 0, 0, 0, 0, 0, 0])['headphoneHours'], 2.0);
      expect(_habitData([0, 3, 0, 0, 0, 0, 0, 0])['headphoneHours'], 4.0);
    });

    test('volumeLevel maps to 40/55/70/85', () {
      for (final (i, expected) in [(0, 40.0), (1, 55.0), (2, 70.0), (3, 85.0)]) {
        final answers = [0, 0, 0, 0, i, 0, 0, 0];
        expect(_habitData(answers)['volumeLevel'], expected);
      }
    });

    test('occupationRisk maps Q5 (hearing protection)', () {
      expect(_habitData([0, 0, 0, 0, 0, 0, 0, 0])['occupationRisk'], 0.0);
      expect(_habitData([0, 0, 0, 0, 0, 3, 0, 0])['occupationRisk'], 3.0);
    });

    test('noiseExposure maps Q2', () {
      expect(_habitData([0, 0, 2, 0, 0, 0, 0, 0])['noiseExposure'], 1.5);
    });

    test('smoking (family history) maps Q7', () {
      expect(_habitData([0, 0, 0, 0, 0, 0, 0, 2])['smoking'], 1.5);
    });
  });

  group('HearingMapper.buildPayload — edge cases', () {
    test('mixed profile stays in valid ranges', () {
      final mixed = [1, 2, 1, 0, 2, 1, 3, 0];
      final p = HearingMapper.buildPayload(mixed);
      final scores = (p['frequencyScores'] as List).cast<Map<String, dynamic>>();
      for (final s in scores) {
        expect((s['score'] as double), inInclusiveRange(0.0, 10.0));
      }
    });
  });
}
