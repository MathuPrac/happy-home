import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@restaurant/shared-types$': '<rootDir>/../../packages/shared-types/src/index.ts',
    '^@restaurant/validation$': '<rootDir>/../../packages/validation/src/index.ts',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        exactOptionalPropertyTypes: false, // relax for test mocks
      },
    }],
  },
  clearMocks: true,
  collectCoverageFrom: [
    'modules/**/services/*.service.ts',
  ],
};

export default config;