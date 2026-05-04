import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'core/services/auth_service.dart';
import 'core/services/api_client.dart';
import 'features/splash/splash_screen.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/register_screen.dart';
import 'features/shell/main_shell.dart';
import 'features/hearing/hearing_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final auth = AuthService();
  await auth.loadFromStorage();
  runApp(HearGuardApp(auth: auth));
}

class HearGuardApp extends StatelessWidget {
  const HearGuardApp({super.key, required this.auth});
  final AuthService auth;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthService>.value(value: auth),
        ProxyProvider<AuthService, ApiClient>(
          update: (_, authSvc, prev) => prev?..updateAuth(authSvc) ?? ApiClient(auth: authSvc),
        ),
      ],
      child: MaterialApp(
        title: 'HearGuard AI',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.dark,
        initialRoute: '/',
        routes: {
          '/':        (_) => const SplashScreen(),
          '/login':   (_) => const LoginScreen(),
          '/register':(_) => const RegisterScreen(),
          '/shell':   (_) => const MainShell(),
          '/hearing': (_) => const HearingScreen(),
        },
      ),
    );
  }
}
