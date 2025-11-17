module.exports = {
  apps: [
    {
      name: 'afilo-app',
      script: './server.js',
      cwd: '/root/afilo-nextjs-shopify-app',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_file: '.env.production.local',
      instances: 2, // Optimized from 'max' (3) to 2 - Performance Optimization Option A
      exec_mode: 'cluster',
      max_memory_restart: '2G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      shutdown_with_message: true,
      // Graceful shutdown
      exp_backoff_restart_delay: 100,
      // Cluster mode settings
      instance_var: 'INSTANCE_ID',
      // Merge logs from all instances
      merge_logs: true,
      // Log date format
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Process management
      vizion: true,
      post_update: ['pnpm install', 'pnpm build'],
      // Environment-specific settings
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        INSTANCE_MODE: 'cluster'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        INSTANCE_MODE: 'fork'
      }
    }
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/afilo-nextjs-shopify-app.git',
      path: '/var/www/afilo',
      'post-deploy': 'pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'echo "Deploying to production server..."',
      'post-setup': 'ls -la'
    }
  }
};
