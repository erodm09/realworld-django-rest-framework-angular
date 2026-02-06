import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';

export interface Config {
  application: {
    frontendUrl: string;
    backendUrl: string;
  };
  accounts: {
    userA: {
      username: string;
      email: string;
      password: string;
    };
    userB: {
      username: string;
      email: string;
      password: string;
    };
    wrongPassword: string;
  };
  testData: {
    article: {
      description: string;
      body: string;
      tags: string[];
    };
    updatedArticle: {
      body: string;
      tags: string[];
    };
    filterTag: string;
  };
  timeouts: {
    navigation: number;
    element: number;
    api: number;
  };
}

let cachedConfig: Config | null = null;

/** Env var override helper. */
function env(key: string): string | undefined {
  return process.env[key];
}

export function loadConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = path.join(__dirname, '..', 'config.yaml');
  const file = yaml.parse(fs.readFileSync(configPath, 'utf8')) as Config;

  cachedConfig = {
    application: {
      frontendUrl: env('FRONTEND_URL') || file.application.frontendUrl,
      backendUrl:  env('BACKEND_URL')  || file.application.backendUrl,
    },
    accounts: {
      userA: {
        username: env('USER_A_USERNAME') || file.accounts.userA.username,
        email:    env('USER_A_EMAIL')    || file.accounts.userA.email,
        password: env('USER_A_PASSWORD') || file.accounts.userA.password,
      },
      userB: {
        username: env('USER_B_USERNAME') || file.accounts.userB.username,
        email:    env('USER_B_EMAIL')    || file.accounts.userB.email,
        password: env('USER_B_PASSWORD') || file.accounts.userB.password,
      },
      wrongPassword: env('WRONG_PASSWORD') || file.accounts.wrongPassword,
    },
    testData: file.testData,
    timeouts: {
      navigation: Number(env('TIMEOUT_NAVIGATION')) || file.timeouts.navigation,
      element:    Number(env('TIMEOUT_ELEMENT'))     || file.timeouts.element,
      api:        Number(env('TIMEOUT_API'))          || file.timeouts.api,
    },
  };

  return cachedConfig;
}
