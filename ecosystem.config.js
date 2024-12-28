module.exports = {
    apps: [{
      name: 'torelas-pay',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      env: {
        PORT: 3000,
        HOST: 'localhost'
      }
    }]
  }