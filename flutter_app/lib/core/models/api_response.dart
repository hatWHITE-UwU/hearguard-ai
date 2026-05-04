class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final String? error;

  const ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.error,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> j,
    T Function(Map<String, dynamic>)? fromData,
  ) {
    return ApiResponse(
      success: j['success'] as bool? ?? false,
      data: fromData != null && j['data'] != null
          ? fromData(j['data'] as Map<String, dynamic>)
          : null,
      message: j['message'] as String?,
      error: j['error'] as String?,
    );
  }
}

class AuthData {
  final String accessToken;
  final String refreshToken;
  final Map<String, dynamic> userJson;

  const AuthData({
    required this.accessToken,
    required this.refreshToken,
    required this.userJson,
  });

  factory AuthData.fromJson(Map<String, dynamic> j) => AuthData(
        accessToken: j['accessToken'] as String,
        refreshToken: j['refreshToken'] as String,
        userJson: j['user'] as Map<String, dynamic>,
      );
}
