import 'package:flutter/material.dart';

class AppTheme {
  static const Color bgPrimary   = Color(0xFF0D1516);
  static const Color bgCard      = Color(0xFF192122);
  static const Color bgCard2     = Color(0xFF242B2D);
  static const Color accentCyan  = Color(0xFF00E5FF);
  static const Color accentPurple= Color(0xFF7C4DFF);
  static const Color success     = Color(0xFF22C55E);
  static const Color warning     = Color(0xFFF59E0B);
  static const Color danger      = Color(0xFFFF6B6B);
  static const Color textPrimary = Color(0xFFDCE4E5);
  static const Color textMuted   = Color(0xFFBAC9CC);
  static const Color textMuted2  = Color(0xFF849396);
  static const Color border      = Color(0x1AFFFFFF);
  static const Color borderStrong= Color(0xFF3B494C);

  static ThemeData get dark => ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: bgPrimary,
        colorScheme: const ColorScheme.dark(
          primary: accentCyan,
          secondary: accentPurple,
          surface: bgCard,
          error: danger,
        ),
        useMaterial3: true,
        fontFamily: 'Roboto',
        appBarTheme: const AppBarTheme(
          backgroundColor: bgPrimary,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: TextStyle(
            color: textPrimary,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
          iconTheme: IconThemeData(color: accentCyan),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Color(0xFF0D1516),
          selectedItemColor: accentCyan,
          unselectedItemColor: textMuted2,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
        ),
        cardTheme: const CardTheme(
          color: bgCard,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(16)),
            side: BorderSide(color: border),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFF151D1E),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: borderStrong),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: borderStrong),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: accentCyan, width: 1.5),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: danger),
          ),
          labelStyle: const TextStyle(color: textMuted, fontSize: 14),
          hintStyle: const TextStyle(color: textMuted2, fontSize: 14),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: accentCyan,
            foregroundColor: Colors.black,
            minimumSize: const Size(double.infinity, 52),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(foregroundColor: accentCyan),
        ),
      );
}
