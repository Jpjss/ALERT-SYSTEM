module.exports = {
  apps: [
    {
      name: 'alert-system',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'postgresql://alert_user:alert_secure_pass_2024@localhost:5432/alert_system'
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '512M',
      node_args: '--max-old-space-size=256',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      merge_logs: true
    }
  ]
};
