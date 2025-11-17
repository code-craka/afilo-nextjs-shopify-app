const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Graceful shutdown handler
let server;
let isShuttingDown = false;

function gracefulShutdown(signal) {
  if (isShuttingDown) return;

  console.log(`\n${signal} received. Starting graceful shutdown...`);
  isShuttingDown = true;

  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // PM2 reload signal

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
app.prepare().then(() => {
  server = createServer(async (req, res) => {
    try {
      // Parse URL
      const parsedUrl = parse(req.url, true);

      // Health check endpoint for faster responses
      if (parsedUrl.pathname === '/api/health' && req.method === 'HEAD') {
        res.writeHead(200);
        res.end();
        return;
      }

      // Handle all other requests with Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling request:', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Start listening
  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }

    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV}`);
    console.log(`> Instance ID: ${process.env.INSTANCE_ID || 0}`);

    // Notify PM2 that the app is ready
    if (process.send) {
      process.send('ready');
    }
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
    }
  });

  // Handle connection errors
  server.on('clientError', (err, socket) => {
    console.error('Client error:', err.message);
    if (socket.writable) {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
  });
}).catch((error) => {
  console.error('Failed to prepare Next.js app:', error);
  process.exit(1);
});

// Log startup information
console.log('Starting Afilo Marketplace...');
console.log(`Node version: ${process.version}`);
console.log(`Platform: ${process.platform} ${process.arch}`);
console.log(`Memory: ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`);
