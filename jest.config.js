module.exports = {
    testEnvironment: "jsdom",
    moduleNameMapper: {
        "\\.(css|scss)$": "identity-obj-proxy",
        "@components": "<rootDir>/src/components/index",
        "@domain": "<rootDir>/src/domain/index",
    },
    collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/**/index.ts"],
    coverageThreshold: {
        global: {
            branches: 95,
            functions: 95,
            lines: 95,
            statements: 95,
        },
    },
    setupFilesAfterEnv: ["<rootDir>/scripts/setupTest.js"],
}
