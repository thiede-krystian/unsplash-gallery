import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './'
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts', '<rootDir>/jest.env.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)']
};

export default createJestConfig(config);
