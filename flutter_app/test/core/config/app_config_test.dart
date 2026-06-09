import 'package:flutter_test/flutter_test.dart';
import 'package:hearguard_app/core/config/app_config.dart';

void main() {
  group('AppConfig', () {
    test('apiUrl is a non-empty string', () {
      expect(AppConfig.apiUrl, isNotEmpty);
    });

    test('apiUrl starts with http', () {
      expect(AppConfig.apiUrl, startsWith('http'));
    });

    test('accessKey is non-empty', () {
      expect(AppConfig.accessKey, isNotEmpty);
    });

    test('refreshKey is non-empty', () {
      expect(AppConfig.refreshKey, isNotEmpty);
    });

    test('accessKey and refreshKey are different', () {
      expect(AppConfig.accessKey, isNot(equals(AppConfig.refreshKey)));
    });
  });
}
