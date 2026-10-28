// Reads values from the ".env" file and exports them in one place.
// The rest of the app imports this file instead of using process.env directly.
const dotenv = require('dotenv');

dotenv.config();

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // "http://a.com,http://b.com" becomes ["http://a.com", "http://b.com"]
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim()),

  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 300,

  seedSampleData: process.env.SEED_SAMPLE_DATA !== 'false',
};

module.exports = env;
