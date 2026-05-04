const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const { validateEnv, getEnv } = require('./src/config/env');
validateEnv();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

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
            } catch {
              retryMongo();
            }
          }, 15_000);
        };
        retryMongo();
        return;
      }
      process.exit(1);
    }
    throw err;
  }
}

if (require.main === module) {
  startServer().catch((err) => {
    logger.error('No se pudo iniciar el servidor: ' + err?.message);
    process.exit(1);
  });
}

module.exports = { app, startServer };
