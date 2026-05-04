import 'package:flutter_test/flutter_test.dart';
import 'package:hearguard_app/core/models/user.dart';

void main() {
  group('User.fromJson', () {
    test('parses all fields from server response', () {
      final u = User.fromJson({
        '_id': 'abc123',
        'name': 'María García',
        'email': 'maria@example.com',
        'age': 28,
        'gender': 'female',
        'occupation': 'Enfermera',
        'city': 'Lima',
      });

      expect(u.id, 'abc123');
      expect(u.name, 'María García');
      expect(u.email, 'maria@example.com');
      expect(u.age, 28);
      expect(u.gender, 'female');
      expect(u.occupation, 'Enfermera');
      expect(u.city, 'Lima');
    });

    test('accepts "id" key (camelCase) as well as "_id"', () {
      final u = User.fromJson({'id': 'xyz', 'name': 'Juan', 'email': 'j@j.com'});
      expect(u.id, 'xyz');
    });

    test('falls back to empty strings for missing required fields', () {
      final u = User.fromJson({});
      expect(u.id, '');
      expect(u.name, '');
      expect(u.email, '');
    });

    test('optional fields are null when absent', () {
      final u = User.fromJson({'name': 'X', 'email': 'x@x.com'});
      expect(u.age, isNull);
      expect(u.gender, isNull);
      expect(u.city, isNull);
    });
  });

  group('User.initials', () {
    test('two-word name returns first letters uppercased', () {
      final u = User.fromJson({'name': 'Juan Pérez', 'email': ''});
      expect(u.initials, 'JP');
    });

    test('three-word name uses first two parts', () {
      final u = User.fromJson({'name': 'Ana María López', 'email': ''});
      expect(u.initials, 'AM');
    });

    test('single name returns first letter', () {
      final u = User.fromJson({'name': 'Carlos', 'email': ''});
      expect(u.initials, 'C');
    });

    test('empty name returns fallback U', () {
      final u = User.fromJson({'name': '', 'email': ''});
      expect(u.initials, 'U');
    });

    test('extra whitespace is trimmed', () {
      final u = User.fromJson({'name': '  Luis  Mamani  ', 'email': ''});
      expect(u.initials, 'LM');
    });

    test('lowercased input is uppercased', () {
      final u = User.fromJson({'name': 'rosa quito', 'email': ''});
      expect(u.initials, 'RQ');
    });
  });

  group('User.firstName', () {
    test('returns first word of name', () {
      final u = User.fromJson({'name': 'Luis Alberto Flores', 'email': ''});
      expect(u.firstName, 'Luis');
    });

    test('single name returns itself', () {
      final u = User.fromJson({'name': 'Renata', 'email': ''});
      expect(u.firstName, 'Renata');
    });

    test('empty name returns fallback "usuario"', () {
      final u = User.fromJson({'name': '', 'email': ''});
      expect(u.firstName, 'usuario');
    });
  });
}
