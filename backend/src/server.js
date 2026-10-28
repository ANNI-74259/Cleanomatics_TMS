// Entry point: starts the server. Run with "npm run dev".
const app = require('./app');
const env = require('./config/env');
const taskService = require('./services/task.service');

if (env.seedSampleData) {
  taskService.seedSampleTasks();
}

const server = app.listen(env.port, () => {
  console.log(`Server running in ${env.nodeEnv} mode on http://localhost:${env.port}`);
});

// Stop the server cleanly when it is asked to shut down
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server stopped');
  });
});
