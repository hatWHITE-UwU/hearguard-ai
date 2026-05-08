import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../lib/core/services/auth_service.dart';
import '../../../lib/core/models/user.dart';

User _fakeUser({String name = 'Luis'}) => User(
      id: 'u1',
      name: name,
      email: 'luis@test.com',
      age: 22,
      gender: 'male',
      occupation: 'Dev',
      city: 'Lima',
    );

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('AuthService', () {
    test('initial state: not authenticated, no user', () {
      final svc = AuthService();
      expect(svc.isAuthenticated, isFalse);
      expect(svc.user, isNull);
      expect(svc.accessToken, isNull);
    });

    test('persistSession stores tokens and user', () async {
      final svc = AuthService();
      await svc.persistSession(
        access: 'acc-tok',
        refresh: 'ref-tok',
        user: _fakeUser(),
      );
      expect(svc.isAuthenticated, isTrue);
      expect(svc.accessToken, 'acc-tok');
      expect(svc.refreshToken, 'ref-tok');
      expect(svc.user!.name, 'Luis');
    });

    test('loadFromStorage restores tokens saved by persistSession', () async {
      final svc = AuthService();
      await svc.persistSession(
        access: 'stored-acc',
        refresh: 'stored-ref',
        user: _fakeUser(),
      );

      final svc2 = AuthService();
      await svc2.loadFromStorage();
      expect(svc2.accessToken, 'stored-acc');
      expect(svc2.refreshToken, 'stored-ref');
    });

    test('loadFromStorage yields null tokens when SharedPreferences is empty',
        () async {
      final svc = AuthService();
      await svc.loadFromStorage();
      expect(svc.accessToken, isNull);
      expect(svc.refreshToken, isNull);
    });

    test('logout clears tokens, user, and SharedPreferences', () async {
      final svc = AuthService();
      await svc.persistSession(
        access: 'acc',
        refresh: 'ref',
        user: _fakeUser(),
      );
      await svc.logout();

      expect(svc.isAuthenticated, isFalse);
      expect(svc.accessToken, isNull);
      expect(svc.refreshToken, isNull);
      expect(svc.user, isNull);

      final svc2 = AuthService();
      await svc2.loadFromStorage();
      expect(svc2.accessToken, isNull);
    });

    test('updateUser replaces user without touching tokens', () async {
      final svc = AuthService();
      await svc.persistSession(
        access: 'acc',
        refresh: 'ref',
        user: _fakeUser(),
      );
      await svc.updateUser(_fakeUser(name: 'Luis Updated'));
      expect(svc.user!.name, 'Luis Updated');
      expect(svc.accessToken, 'acc');
    });

    test('updateTokens stores new tokens in SharedPreferences', () async {
      final svc = AuthService();
      await svc.persistSession(
          access: 'old', refresh: 'old-ref', user: _fakeUser());
      await svc.updateTokens(access: 'new-acc', refresh: 'new-ref');

      expect(svc.accessToken, 'new-acc');
      expect(svc.refreshToken, 'new-ref');

      final svc2 = AuthService();
      await svc2.loadFromStorage();
      expect(svc2.accessToken, 'new-acc');
    });

    test('notifyListeners fires on persistSession', () async {
      final svc = AuthService();
      var notified = false;
      svc.addListener(() => notified = true);
      await svc.persistSession(
          access: 'a', refresh: 'r', user: _fakeUser());
      expect(notified, isTrue);
    });

    test('notifyListeners fires on logout', () async {
      final svc = AuthService();
      await svc.persistSession(
          access: 'a', refresh: 'r', user: _fakeUser());
      var notified = false;
      svc.addListener(() => notified = true);
      await svc.logout();
      expect(notified, isTrue);
    });
  });
}
