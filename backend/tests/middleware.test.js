'use strict';

const { notFoundHandler, errorHandler } = require('../src/middleware/errorHandler');

describe('Middleware — notFoundHandler & errorHandler', () => {
  let req, res;

  beforeEach(() => {
    req = { method: 'GET', url: '/test' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  // ── notFoundHandler ──────────────────────────────────────────────────────────

  describe('notFoundHandler', () => {
    it('retorna 404 con formato estándar', () => {
      notFoundHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'NOT_FOUND',
        message: 'Recurso no encontrado',
      });
    });
  });

  // ── errorHandler — clasificación de errores ──────────────────────────────────

  describe('errorHandler — tipos de error conocidos', () => {
    it('JsonWebTokenError → 401 UNAUTHORIZED', () => {
      const err = Object.assign(new Error('invalid signature'), { name: 'JsonWebTokenError' });
      errorHandler(err, req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'UNAUTHORIZED' }));
    });

    it('TokenExpiredError → 401 UNAUTHORIZED', () => {
      const err = Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });
      errorHandler(err, req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'UNAUTHORIZED' }));
    });

    it('err.code === 11000 (numérico) → 409 CONFLICT', () => {
      const err = Object.assign(new Error('E11000 duplicate key'), { code: 11000 });
      errorHandler(err, req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'CONFLICT' }));
    });

    it('err.code === "11000" (string) → 409 CONFLICT', () => {
      const err = Object.assign(new Error('E11000 duplicate key'), { code: '11000' });
      errorHandler(err, req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'CONFLICT' }));
    });

    it('error genérico → 500 INTERNAL_ERROR con el mensaje real (fuera de producción)', () => {
      const err = new Error('boom interno');
      errorHandler(err, req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'INTERNAL_ERROR',
        message: 'boom interno',
      }));
    });

    it('err con statusCode y code propios los usa directamente', () => {
      const err = Object.assign(new Error('entidad sin procesar'), { statusCode: 422, code: 'UNPROCESSABLE' });
      errorHandler(err, req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'UNPROCESSABLE',
        message: 'entidad sin procesar',
      }));
    });

    it('err sin statusCode usa 500 por defecto', () => {
      const err = new Error('sin código');
      errorHandler(err, req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('err sin code usa INTERNAL_ERROR por defecto', () => {
      const err = new Error('sin código de error');
      errorHandler(err, req, res, jest.fn());
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'INTERNAL_ERROR' }));
    });

    it('err.message vacío usa mensaje genérico', () => {
      const err = Object.assign(new Error(''), { statusCode: 500 });
      errorHandler(err, req, res, jest.fn());
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Error interno del servidor',
      }));
    });
  });

  // ── errorHandler — comportamiento en producción ───────────────────────────────

  describe('errorHandler — modo producción', () => {
    let prevNodeEnv;

    beforeEach(() => {
      prevNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
    });

    afterEach(() => {
      process.env.NODE_ENV = prevNodeEnv;
    });

    it('500 en producción reemplaza el mensaje real por genérico', () => {
      const err = new Error('detalles internos confidenciales');
      errorHandler(err, req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Error interno del servidor',
      }));
    });

    it('4xx en producción conserva el mensaje real', () => {
      const err = Object.assign(new Error('correo ya registrado'), { statusCode: 409, code: 'CONFLICT' });
      errorHandler(err, req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'correo ya registrado',
      }));
    });

    it('500 en producción con JsonWebTokenError → 401 y muestra el mensaje (no oculta 4xx)', () => {
      const err = Object.assign(new Error('token inválido'), { name: 'JsonWebTokenError' });
      errorHandler(err, req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'UNAUTHORIZED' }));
    });
  });
});
