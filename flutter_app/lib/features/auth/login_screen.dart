import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/api_client.dart';
import '../../core/models/user.dart';
import '../../core/theme/app_theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscure = true;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    try {
      final api  = context.read<ApiClient>();
      final auth = context.read<AuthService>();
      final res  = await api.post('/api/auth/login', data: {
        'email': _emailCtrl.text.trim(),
        'password': _passwordCtrl.text,
      });
      final data = res['data'] as Map<String, dynamic>;
      await auth.persistSession(
        access:  data['accessToken'] as String,
        refresh: data['refreshToken'] as String,
        user: User.fromJson(data['user'] as Map<String, dynamic>),
      );
      if (mounted) Navigator.pushReplacementNamed(context, '/shell');
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String?;
      setState(() { _error = msg ?? 'Correo o contraseña incorrectos.'; });
    } catch (_) {
      setState(() { _error = 'No se pudo conectar con el servidor.'; });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Brand
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 72, height: 72,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppTheme.accentCyan.withOpacity(0.1),
                        border: Border.all(color: AppTheme.accentCyan.withOpacity(0.4), width: 2),
                      ),
                      child: const Icon(Icons.hearing, size: 34, color: AppTheme.accentCyan),
                    ),
                    const SizedBox(height: 16),
                    RichText(
                      text: const TextSpan(
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
                        children: [
                          TextSpan(text: 'Hear', style: TextStyle(color: AppTheme.textPrimary)),
                          TextSpan(text: 'Guard', style: TextStyle(color: AppTheme.accentCyan)),
                          TextSpan(text: ' AI', style: TextStyle(color: AppTheme.accentPurple, fontSize: 18)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 36),
              const Text('¡Bienvenido!', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              const SizedBox(height: 4),
              const Text('Inicia sesión para continuar', style: TextStyle(color: AppTheme.textMuted, fontSize: 14)),
              const SizedBox(height: 28),

              // Form
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    TextFormField(
                      controller: _emailCtrl,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      style: const TextStyle(color: AppTheme.textPrimary),
                      decoration: const InputDecoration(labelText: 'Correo electrónico'),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Introduce tu correo.';
                        if (!v.contains('@')) return 'Correo no válido.';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _passwordCtrl,
                      obscureText: _obscure,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _submit(),
                      style: const TextStyle(color: AppTheme.textPrimary),
                      decoration: InputDecoration(
                        labelText: 'Contraseña',
                        suffixIcon: IconButton(
                          icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility, color: AppTheme.textMuted2, size: 20),
                          onPressed: () => setState(() => _obscure = !_obscure),
                        ),
                      ),
                      validator: (v) => (v == null || v.length < 8) ? 'Mínimo 8 caracteres.' : null,
                    ),
                    const SizedBox(height: 12),
                    if (_error != null)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: AppTheme.danger.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppTheme.danger.withOpacity(0.4)),
                        ),
                        child: Text(_error!, style: const TextStyle(color: Color(0xFFFFB4B4), fontSize: 13)),
                      ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: _loading ? null : _submit,
                      child: _loading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                          : const Text('Iniciar sesión'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('¿No tienes cuenta? ', style: TextStyle(color: AppTheme.textMuted, fontSize: 14)),
                  GestureDetector(
                    onTap: () => Navigator.pushReplacementNamed(context, '/register'),
                    child: const Text('Regístrate', style: TextStyle(color: AppTheme.accentCyan, fontWeight: FontWeight.w600, fontSize: 14)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
