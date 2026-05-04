import 'package:flutter_test/flutter_test.dart';
import 'package:hearguard_app/core/models/api_response.dart';

void main() {
  group('ApiResponse.fromJson', () {
    test('parses success response without data transformer', () {
      final r = ApiResponse.fromJson(
        {'success': true, 'message': 'OK'},
        null,
      );
      expect(r.success, isTrue);
      expect(r.message, 'OK');
      expect(r.data, isNull);
      expect(r.error, isNull);
    });

    test('parses error response', () {
      final r = ApiResponse<void>.fromJson(
        {'success': false, 'error': 'NOT_FOUND', 'message': 'No encontrado'},
        null,
      );
      expect(r.success, isFalse);
      expect(r.error, 'NOT_FOUND');
      expect(r.message, 'No encontrado');
    });

    test('applies data transformer when provided', () {
      final r = ApiResponse.fromJson(
        {
          'success': true,
          'data': {'value': 42},
        },
        (json) => json['value'] as int,
      );
      expect(r.data, 42);
    });

    test('defaults success to false when key absent', () {
      final r = ApiResponse<void>.fromJson({}, null);
      expect(r.success, isFalse);
    });
  });

  group('AuthData.fromJson', () {
    test('parses login response correctly', () {
      final a = AuthData.fromJson({
        'accessToken': 'acc.token.here',
        'refreshToken': 'ref.token.here',
        'user': {'_id': 'u1', 'name': 'Test', 'email': 't@t.com'},
      });

      expect(a.accessToken, 'acc.token.here');
      expect(a.refreshToken, 'ref.token.here');
      expect(a.userJson['_id'], 'u1');
    });
  });
}
