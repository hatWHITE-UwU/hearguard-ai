import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';
import '../models/user.dart';

class AuthService extends ChangeNotifier {
  User? _user;
  String? _accessToken;
  String? _refreshToken;

  User? get user => _user;
  String? get accessToken => _accessToken;
  bool get isAuthenticated => _accessToken != null && _user != null;

  Future<void> loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    _accessToken = prefs.getString(AppConfig.accessKey);
    _refreshToken = prefs.getString(AppConfig.refreshKey);
    notifyListeners();
  }

  Future<void> persistSession({
    required String access,
    required String refresh,
    required User user,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConfig.accessKey, access);
    await prefs.setString(AppConfig.refreshKey, refresh);
    _accessToken = access;
    _refreshToken = refresh;
    _user = user;
    notifyListeners();
  }

  Future<void> updateUser(User user) async {
    _user = user;
    notifyListeners();
  }

  String? get refreshToken => _refreshToken;

  Future<void> updateTokens({required String access, required String refresh}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConfig.accessKey, access);
    await prefs.setString(AppConfig.refreshKey, refresh);
    _accessToken = access;
    _refreshToken = refresh;
    notifyListeners();
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConfig.accessKey);
    await prefs.remove(AppConfig.refreshKey);
    _accessToken = null;
    _refreshToken = null;
    _user = null;
    notifyListeners();
  }
}
