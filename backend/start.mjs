// PM2 v3 ES Module wrapper
import('./server.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
