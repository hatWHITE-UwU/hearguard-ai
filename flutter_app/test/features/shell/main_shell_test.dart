import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:hearguard_app/core/services/auth_service.dart';
import 'package:hearguard_app/core/services/api_client.dart';
import 'package:hearguard_app/features/shell/main_shell.dart';

/// Stub que evita llamadas HTTP reales en tests de widget.
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

Widget _shell() {
  final auth = AuthService();
  final api  = _StubApiClient(auth);
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthService>.value(value: auth),
      Provider<ApiClient>.value(value: api),
    ],
    child: MaterialApp(
      routes: {
        '/hearing': (_) => const Scaffold(body: Text('Hearing')),
      },
      home: const MainShell(),
    ),
  );
}

/// Mockea los canales de plataforma de permission_handler y noise_meter.
/// En CI (Linux, sin hardware de audio), estos plugins lanzan
/// MissingPluginException si no se interceptan, fallando tests con pump().
void _mockPlatformChannels() {
  // permission_handler — devuelve "denied" (0) para todos los permisos
  TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
      .setMockMethodCallHandler(
        const MethodChannel('flutter.baseflow.com/permissions/methods'),
        (MethodCall call) async {
          // checkPermissionStatus / requestPermissions → denied
          if (call.method == 'checkPermissionStatus') return 0;
          if (call.method == 'requestPermissions') return <int, int>{0: 0};
          return null;
        },
      );
  // noise_meter event channel — no emite eventos
  TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
      .setMockStreamHandler(
        const EventChannel('noise_meter.flutter.io/noise'),
        MockStreamHandler.inline(onListen: (args, events) {}),
      );
}

void main() {
  setUpAll(_mockPlatformChannels);

  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('MainShell renders BottomNavigationBar', (tester) async {
    await tester.pumpWidget(_shell());
    expect(find.byType(BottomNavigationBar), findsOneWidget);
  });

  testWidgets('BottomNavigationBar tiene 4 items', (tester) async {
    await tester.pumpWidget(_shell());
    final nav = tester.widget<BottomNavigationBar>(find.byType(BottomNavigationBar));
    expect(nav.items.length, 4);
  });

  testWidgets('labels son Inicio, Monitor, Historial, Perfil', (tester) async {
    await tester.pumpWidget(_shell());
    expect(find.text('Inicio'),    findsOneWidget);
    expect(find.text('Monitor'),   findsOneWidget);
    expect(find.text('Historial'), findsOneWidget);
    expect(find.text('Perfil'),    findsOneWidget);
  });

  testWidgets('título inicial del AppBar es Dashboard', (tester) async {
    await tester.pumpWidget(_shell());
    expect(find.text('Dashboard'), findsOneWidget);
  });

  testWidgets('tap en Monitor cambia título a Monitoreo', (tester) async {
    await tester.pumpWidget(_shell());
    await tester.tap(find.text('Monitor'));
    await tester.pump();
    expect(find.text('Monitoreo'), findsOneWidget);
  });

  testWidgets('tap en Historial cambia título a Historial', (tester) async {
    await tester.pumpWidget(_shell());
    await tester.tap(find.text('Historial'));
    await tester.pump();
    // Busca específicamente en el AppBar para evitar coincidencias en IndexedStack
    expect(find.widgetWithText(AppBar, 'Historial'), findsOneWidget);
  });

  testWidgets('tap en Perfil cambia título a Perfil', (tester) async {
    await tester.pumpWidget(_shell());
    await tester.tap(find.text('Perfil'));
    await tester.pump();
    // Busca específicamente en el AppBar para evitar coincidencias en IndexedStack
    expect(find.widgetWithText(AppBar, 'Perfil'), findsOneWidget);
  });

  testWidgets('Dashboard muestra botón de prueba auditiva en AppBar', (tester) async {
    await tester.pumpWidget(_shell());
    expect(find.byIcon(Icons.graphic_eq), findsOneWidget);
  });

  testWidgets('botón prueba auditiva NO aparece en pestaña Monitor', (tester) async {
    await tester.pumpWidget(_shell());
    await tester.tap(find.text('Monitor'));
    await tester.pump();
    expect(find.byIcon(Icons.graphic_eq), findsNothing);
  });
}
