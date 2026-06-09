import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hearguard_app/core/theme/app_theme.dart';

void main() {
  group('AppTheme — colores de marca', () {
    test('accentCyan tiene valor correcto', () {
      expect(AppTheme.accentCyan, const Color(0xFF00E5FF));
    });

    test('accentPurple tiene valor correcto', () {
      expect(AppTheme.accentPurple, const Color(0xFF7C4DFF));
    });

    test('bgPrimary es oscuro (luminance < 0.1)', () {
      expect(AppTheme.bgPrimary.computeLuminance(), lessThan(0.1));
    });

    test('danger es rojo (red channel dominante)', () {
      final c = AppTheme.danger;
      expect(c.red, greaterThan(c.green));
      expect(c.red, greaterThan(c.blue));
    });

    test('success es verde (green channel dominante)', () {
      final c = AppTheme.success;
      expect(c.green, greaterThan(c.red));
    });
  });

  group('AppTheme.dark — ThemeData', () {
    test('devuelve un ThemeData no nulo', () {
      expect(AppTheme.dark, isA<ThemeData>());
    });

    test('brightness es Brightness.dark', () {
      expect(AppTheme.dark.brightness, Brightness.dark);
    });

    test('color primario es accentCyan', () {
      expect(AppTheme.dark.colorScheme.primary, AppTheme.accentCyan);
    });

    test('color de error es danger', () {
      expect(AppTheme.dark.colorScheme.error, AppTheme.danger);
    });

    test('useMaterial3 está activado', () {
      expect(AppTheme.dark.useMaterial3, isTrue);
    });

    test('scaffoldBackgroundColor es bgPrimary', () {
      expect(AppTheme.dark.scaffoldBackgroundColor, AppTheme.bgPrimary);
    });
  });
}
