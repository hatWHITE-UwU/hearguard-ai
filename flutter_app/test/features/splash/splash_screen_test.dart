import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:hearguard_app/core/services/auth_service.dart';
import 'package:hearguard_app/core/services/api_client.dart';
import 'package:hearguard_app/features/splash/splash_screen.dart';

/// Stub sin llamadas HTTP — evita timeout de Dio (15 s) en tests de widget.
class _StubApiClient extends ApiClient {
  _StubApiClient(AuthService auth) : super(auth: auth);

  @override
  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, dynamic>? params,
  }) async =>
      <String, dynamic>{};

  @override
  Future<Map<String, dynamic>> post(String path, {dynamic data}) async =>
      <String, dynamic>{};

  @override
  Future<Map<String, dynamic>> patch(String path, {dynamic data}) async =>
      <String, dynamic>{};
}

Widget _splashApp() {
  final auth = AuthService();
  final api  = _StubApiClient(auth);
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

/// Avanza el fake clock más allá del Future.delayed(1200 ms) de _resolve()
/// y drena la animación de navegación con pumpAndSettle.
Future<void> _drainSplash(WidgetTester tester) async {
  await tester.pump();                                        // microtask loadFromStorage
  await tester.pump(const Duration(milliseconds: 1300));     // > 1200ms delay
  await tester.pumpAndSettle();                              // anima transición de ruta
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('SplashScreen muestra ícono de hearing', (tester) async {
    await tester.pumpWidget(_splashApp());
    await tester.pump(); // frame inicial — widget en árbol con opacity > 0 tras 1er frame
    expect(find.byIcon(Icons.hearing), findsOneWidget);
    await _drainSplash(tester);
  });

  testWidgets('SplashScreen muestra texto HearGuard AI', (tester) async {
    await tester.pumpWidget(_splashApp());
    await tester.pump();
    expect(find.textContaining('Hear'), findsWidgets);
    await _drainSplash(tester);
  });

  testWidgets('SplashScreen muestra indicador de carga', (tester) async {
    await tester.pumpWidget(_splashApp());
    await tester.pump();
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    await _drainSplash(tester);
  });

  testWidgets('SplashScreen muestra subtítulo de la app', (tester) async {
    await tester.pumpWidget(_splashApp());
    await tester.pump();
    expect(
      find.text('Cuida tu audición, protege tu futuro'),
      findsOneWidget,
    );
    await _drainSplash(tester);
  });

  testWidgets('sin token navega a /login tras resolver', (tester) async {
    await tester.pumpWidget(_splashApp());
    await _drainSplash(tester);
    expect(find.text('Login'), findsOneWidget);
  });
}
