class User {
  final String id;
  final String name;
  final String email;
  final int? age;
  final String? gender;
  final String? occupation;
  final String? city;

  const User({
    required this.id,
    required this.name,
    required this.email,
    this.age,
    this.gender,
    this.occupation,
    this.city,
  });

  factory User.fromJson(Map<String, dynamic> j) => User(
        id: j['id'] as String? ?? j['_id'] as String? ?? '',
        name: j['name'] as String? ?? '',
        email: j['email'] as String? ?? '',
        age: j['age'] as int?,
        gender: j['gender'] as String?,
        occupation: j['occupation'] as String?,
        city: j['city'] as String?,
      );

  String get initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return 'U';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }

  String get firstName {
    final parts = name.trim().split(RegExp(r'\s+'));
    return parts.isNotEmpty ? parts[0] : 'usuario';
  }
}
