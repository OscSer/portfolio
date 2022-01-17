module.exports = {
    testEnvironment: "jsdom",
    moduleNameMapper: {
        "\\.(css|scss)$": "identity-obj-proxy",
        "@components": "<rootDir>/src/components/index",
        "@domain": "<rootDir>/src/domain/index",
        "@services": "<rootDir>/src/services/index",
        "@hooks": "<rootDir>/src/hooks/index",
    },
    collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/**/index.ts"],
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0,
        },
    },
    setupFilesAfterEnv: ["<rootDir>/scripts/setupTest.js"],
}
