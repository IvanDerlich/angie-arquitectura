const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
  },
  webServer: {
    command: 'npx http-server -p 8080 --silent',
    port: 8080,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
