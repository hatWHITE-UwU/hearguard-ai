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

const { connectDatabase } = require('./src/config/database');
const authRoutes = require('./src/routes/auth.routes');
const {
  notFoundHandler,
  errorHandler,
} = require('./src/middleware/errorHandler');

const app = express();
const env = getEnv();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: '10kb' }));
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

if (env.NODE_ENV !== 'test') {
  app.use('/api', apiLimiter);
}

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok' },
    message: 'Servicio disponible',
  });
});

app.use('/api/auth', authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  await connectDatabase();
  if (require.main === module) {
    app.listen(env.PORT, () => {
      console.log(`HearGuard API escuchando en puerto ${env.PORT}`);
    });
  }
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  });
}

module.exports = { app, startServer };
