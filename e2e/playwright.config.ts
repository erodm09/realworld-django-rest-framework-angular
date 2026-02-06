import { defineConfig, devices } from '@playwright/test';
import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';

const configPath = path.join(__dirname, 'config.yaml');
const configFile = fs.readFileSync(configPath, 'utf8');
const config = yaml.parse(configFile);

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: config.application.frontendUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
