const path = require('node:path');
const fs = require('node:fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const { validateEnv, getEnv } = require('./src/config/env');
validateEnv();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');

const { connectDatabase, mongoose } = require('./src/config/database');
const logger = require('./src/utils/logger');
const authRoutes = require('./src/routes/auth.routes');
const evaluationRoutes = require('./src/routes/evaluation.routes');
const noiseRoutes = require('./src/routes/noise.routes');
const deviceRoutes = require('./src/routes/device.routes');
const {
  notFoundHandler,
  errorHandler,
} = require('./src/middleware/errorHandler');

const app = express();
const env = getEnv();

app.set('trust proxy', 1);

app.use(helmet());
const corsOrigins = new Set(
  [
    env.FRONTEND_URL,
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'http://localhost:4201',
    'http://127.0.0.1:4201',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
  ].filter(Boolean),
);
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || corsOrigins.has(origin)) {
        return cb(null, true);
      }
      return cb(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '256kb' }));
app.use(
  morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    skip: () => env.NODE_ENV === 'test',
  }),
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (_req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      mongo: mongoReady ? 'connected' : 'disconnected',
    },
    message: mongoReady
      ? 'Servicio disponible'
      : 'API arriba; MongoDB aún no conectado (revisa Atlas / MONGO_URI)',
  });
});

// Utilización de recursos — ISO 9126 Eficiencia › sub-característica "Utilización de recursos"
app.get('/metrics', (_req, res) => {
  const mem = process.memoryUsage();
  const cpu = process.cpuUsage();
  res.status(200).json({
    success: true,
    data: {
      uptime_s: Math.round(process.uptime()),
      memory: {
        rss_mb:        +(mem.rss          / 1024 / 1024).toFixed(2),
        heap_used_mb:  +(mem.heapUsed     / 1024 / 1024).toFixed(2),
        heap_total_mb: +(mem.heapTotal    / 1024 / 1024).toFixed(2),
        external_mb:   +(mem.external     / 1024 / 1024).toFixed(2),
      },
      cpu: {
        user_ms:   +(cpu.user   / 1000).toFixed(2),
        system_ms: +(cpu.system / 1000).toFixed(2),
      },
    },
  });
});

const apiRouter = express.Router();
if (env.NODE_ENV !== 'test') {
  apiRouter.use(apiLimiter);
}

apiRouter.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      service: 'HearGuard API',
      health: '/health',
      routes: {
        register: { method: 'POST', path: '/api/auth/register' },
        login: { method: 'POST', path: '/api/auth/login' },
        refresh: { method: 'POST', path: '/api/auth/refresh' },
      },
    },
    message: 'Usa POST JSON para registro e inicio de sesión (no GET en el navegador).',
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/evaluations', evaluationRoutes);
apiRouter.use('/noise', noiseRoutes);
apiRouter.use('/devices', deviceRoutes);

app.use('/api', apiRouter);

// ── Swagger UI (no disponible en tests) ──────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  const specPath = path.resolve(__dirname, '../docs/api-spec.yml');
  if (fs.existsSync(specPath)) {
    const swaggerDocument = yaml.load(fs.readFileSync(specPath, 'utf8'));
    app.use(
      '/api/docs',
      // Helmet bloquea los assets inline de Swagger; relajamos solo en esta ruta
      (_req, res, next) => {
        res.setHeader('Content-Security-Policy', "default-src 'self' https:; script-src 'self' https:; style-src 'self' 'unsafe-inline' https:; img-src * data: https:; font-src 'self' data: https:; connect-src 'self' https:");
        next();
      },
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        customSiteTitle: 'HearGuard AI — API Docs',
        swaggerOptions: { persistAuthorization: true },
      }),
    );
    logger.info('Swagger UI disponible en /api/docs');
  }
}

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  if (require.main === module) {
    await new Promise((resolve) => {
      app.listen(env.PORT, '0.0.0.0', () => {
        logger.info(`HTTP listo: http://127.0.0.1:${env.PORT}/health — conectando MongoDB…`);
        resolve(undefined);
      });
    });
  }
  try {
    await connectDatabase();
    logger.info('MongoDB listo — /api/* operativo');
  } catch (err) {
    logger.error('MongoDB no conectó tras reintentos.');
    logger.error('Atlas → Network Access → añade tu IP actual o 0.0.0.0/0 (solo dev).');
    logger.error('Local: desde la raíz ejecuta `npm run mongo:local` y revisa MONGO_URI en backend/.env');
    logger.error(`Detalle: ${err?.message?.split('\n')[0] || err}`);
    if (require.main === module) {
      if (getEnv().NODE_ENV === 'development') {
        logger.warn('Desarrollo: el servidor sigue en el puerto; /health y GET /api responden.');
        logger.warn('Sin Mongo, el registro/login fallará hasta conectar. Reintento automático cada 15s…');
        const retryMongo = () => {
          setTimeout(async () => {
            try {
              await connectDatabase();
              logger.info('MongoDB conectado (reintento automático). /api operativo.');
            } catch (retryErr) {
              logger.debug('Reintento MongoDB fallido, programando siguiente intento…', retryErr?.message);
              retryMongo();
            }
          }, 15_000);
        };
        retryMongo();
        return;
      }
      process.exit(1); // eslint-disable-line n/no-process-exit
    }
    throw err;
  }
}

if (require.main === module) {
  startServer().catch((err) => {
    logger.error('No se pudo iniciar el servidor: ' + err?.message);
    process.exit(1); // eslint-disable-line n/no-process-exit
  });
}

module.exports = { app, startServer };
