'use strict';

// Runs before world.js loads backend/server.js (alphabetical require order).
// Sets required env vars so validateEnv() in server.js doesn't throw.
process.env.NODE_ENV = 'test';
if (!process.env.MONGO_URI) process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/hearguard_bdd_test';
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test_jwt_secret_min_32_chars_long_abc123';
if (!process.env.JWT_REFRESH_SECRET) process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_32_chars_long';
if (!process.env.FRONTEND_URL) process.env.FRONTEND_URL = 'http://localhost:4200';
if (!process.env.AI_SERVICE_URL) process.env.AI_SERVICE_URL = 'http://localhost:5001';
