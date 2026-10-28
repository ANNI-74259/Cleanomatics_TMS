// Creates the Express app and connects all middleware and routes.
// ORDER MATTERS: security first, then parsers, then routes, errors last.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const taskRoutes = require('./routes/task.routes');
const apiLimiter = require('./middleware/rateLimiter');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet()); // safe HTTP headers
app.use(cors({ origin: env.clientUrls })); // only our frontend can call the API
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev')); // request logs
app.use(express.json({ limit: '10kb' })); // read JSON body, reject big ones

// Simple check to see if the server is alive (not rate limited)
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

app.use('/api', apiLimiter);
app.use('/api/tasks', taskRoutes);

app.use(notFound); // unknown URL -> 404
app.use(errorHandler); // every error ends here (must be last)

module.exports = app;
