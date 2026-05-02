import 'package:flutter/material.dart';

class AppTheme {
  static const Color bgPrimary = Color(0xFF0D1117);
  static const Color bgSecondary = Color(0xFF0F1923);
  static const Color bgCard = Color(0xFF15202B);
  static const Color accentCyan = Color(0xFF00E5FF);
  static const Color accentPurple = Color(0xFF7C4DFF);
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFFF4D4D);
  static const Color textPrimary = Color(0xFFE8F4F8);
  static const Color textMuted = Color(0xFF8BA3B8);

  static ThemeData get dark => ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: bgPrimary,
        colorScheme: const ColorScheme.dark(
          primary: accentCyan,
          secondary: accentPurple,
          surface: bgCard,
        ),
        useMaterial3: true,
      );
}
