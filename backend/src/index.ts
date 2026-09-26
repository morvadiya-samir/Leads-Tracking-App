import { app } from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  if (process.env.BASIC_AUTH_ENABLED === 'true') {
    console.log(`🔒 Basic Auth is ENABLED (user: ${process.env.BASIC_AUTH_USER || 'admin'})`);
  }
});
