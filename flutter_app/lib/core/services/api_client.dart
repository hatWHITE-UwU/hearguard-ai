import 'package:dio/dio.dart';
import '../config/app_config.dart';
import 'auth_service.dart';

class ApiClient {
  late final Dio _dio;
  final AuthService _auth;

  ApiClient({required AuthService auth}) : _auth = auth {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token = _auth.accessToken;
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (err, handler) async {
          if (err.response?.statusCode == 401 && _auth.refreshToken != null) {
            try {
              final res = await _dio.post(
                '/api/auth/refresh',
                data: {'refreshToken': _auth.refreshToken},
                options: Options(headers: {}),
              );
              final data = res.data['data'];
              await _auth.updateTokens(
                access: data['accessToken'] as String,
                refresh: data['refreshToken'] as String,
              );
              final req = err.requestOptions;
              req.headers['Authorization'] = 'Bearer ${_auth.accessToken}';
              final retry = await _dio.fetch(req);
              return handler.resolve(retry);
            } catch (_) {
              await _auth.logout();
            }
          }
          handler.next(err);
        },
      ),
    );
  }

  // Called by ProxyProvider when AuthService notifies — no-op since interceptor already holds ref
  void updateAuth(AuthService _) {}

  Dio get dio => _dio;

  Future<Map<String, dynamic>> get(String path, {Map<String, dynamic>? params}) async {
    final res = await _dio.get(path, queryParameters: params);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> post(String path, {dynamic data}) async {
    final res = await _dio.post(path, data: data);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> patch(String path, {dynamic data}) async {
    final res = await _dio.patch(path, data: data);
    return res.data as Map<String, dynamic>;
  }
}
