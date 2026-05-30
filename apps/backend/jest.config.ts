import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '/$1',
    '^@restaurant/shared-types$': '/../../../packages/types/src/index.ts',
    '^@restaurant/validation$': '/../../../packages/validation/src/index.ts',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '/../tsconfig.test.json',
    }],
  },
  clearMocks: true,
  collectCoverageFrom: [
    'modules/**/services/*.service.ts',
  ],
};

export default config;