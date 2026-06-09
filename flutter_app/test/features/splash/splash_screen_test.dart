import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:hearguard_app/core/services/auth_service.dart';
import 'package:hearguard_app/core/services/api_client.dart';
import 'package:hearguard_app/features/splash/splash_screen.dart';

Widget _splashApp() {
  final auth = AuthService();
  final api  = ApiClient(auth: auth);
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthService>.value(value: auth),
      Provider<ApiClient>.value(value: api),
    ],
    child: MaterialApp(
      routes: {
        '/login': (_) => const Scaffold(body: Text('Login')),
        '/shell': (_) => const Scaffold(body: Text('Shell')),
      },
      home: const SplashScreen(),
    ),
  );
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('SplashScreen muestra ícono de hearing', (tester) async {
    await tester.pumpWidget(_splashApp());
    expect(find.byIcon(Icons.hearing), findsOneWidget);
  });

  testWidgets('SplashScreen muestra texto HearGuard AI', (tester) async {
    await tester.pumpWidget(_splashApp());
    // RichText con "Hear", "Guard", " AI"
    expect(find.textContaining('Hear'), findsWidgets);
  });

  testWidgets('SplashScreen muestra indicador de carga', (tester) async {
    await tester.pumpWidget(_splashApp());
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });

  testWidgets('SplashScreen muestra subtítulo de la app', (tester) async {
    await tester.pumpWidget(_splashApp());
    expect(
      find.text('Cuida tu audición, protege tu futuro'),
      findsOneWidget,
    );
  });

  testWidgets('sin token navega a /login tras resolver', (tester) async {
    await tester.pumpWidget(_splashApp());
    // Avanza animación (900ms) + delay (1200ms) + frame extra
    await tester.pump(const Duration(milliseconds: 2500));
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.text('Login'), findsOneWidget);
  });
}
