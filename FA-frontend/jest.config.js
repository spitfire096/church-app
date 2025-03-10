const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
    setupFilesAfterEnv: [
        '<rootDir>/src/test/setup.ts',
        '@testing-library/jest-dom'
    ],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@next/font/(.*)$': require.resolve('next/dist/build/jest/__mocks__/nextFontMock.js'),
    },
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/types.ts',
        '!src/**/*.stories.{js,jsx,ts,tsx}',
        '!src/**/index.{js,jsx,ts,tsx}',
        '!**/node_modules/**',
    ],
    coverageThreshold: {
        global: {
            statements: 80,
            branches: 70,
            functions: 80,
            lines: 80
        },
    },
    reporters: ['default'],
    testResultsProcessor: require.resolve('jest-sonar-reporter'),
    coverageReporters: ['json', 'lcov', 'text', 'clover', 'json-summary'],
    testPathIgnorePatterns: ['/node_modules/', '/.next/'],
    transformIgnorePatterns: [
        '/node_modules/',
        '^.+\\.module\\.(css|sass|scss)$',
    ]
}

module.exports = createJestConfig(customJestConfig) 