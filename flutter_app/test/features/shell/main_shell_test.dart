import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:hearguard_app/core/services/auth_service.dart';
import 'package:hearguard_app/core/services/api_client.dart';
import 'package:hearguard_app/features/shell/main_shell.dart';

Widget _shell() {
  final auth = AuthService();
  final api  = ApiClient(auth: auth);
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

void main() {
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
    expect(find.text('Inicio'),   findsOneWidget);
    expect(find.text('Monitor'),  findsOneWidget);
    expect(find.text('Historial'),findsOneWidget);
    expect(find.text('Perfil'),   findsOneWidget);
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
    expect(find.text('Historial'), findsNWidgets(2)); // AppBar + BottomNav
  });

  testWidgets('tap en Perfil cambia título a Perfil', (tester) async {
    await tester.pumpWidget(_shell());
    await tester.tap(find.text('Perfil'));
    await tester.pump();
    expect(find.text('Perfil'), findsNWidgets(2)); // AppBar + BottomNav
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
