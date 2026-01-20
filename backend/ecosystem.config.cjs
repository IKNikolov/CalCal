module.exports = {
  apps: [{
    name: 'calcal-api',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    node_args: '--no-warnings',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true,
    max_memory_restart: '500M',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 5000,
    kill_timeout: 5000,
    wait_ready: false,
    watch: false
  }]
}
