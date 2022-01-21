import "@testing-library/jest-dom/extend-expect"

jest.mock("firebase/database", () => {
    const actual = jest.requireActual("firebase/database")
    return {
        ...actual,
        getDatabase: jest.fn(),
        ref: jest.fn(),
        onDisconnect: jest.fn(() => ({
            remove: jest.fn(() => ({ catch: jest.fn() })),
        })),
    }
})

jest.mock("firebase/auth", () => {
    const actual = jest.requireActual("firebase/auth")
    return {
        ...actual,
        getAuth: jest.fn(() => ({
            setPersistence: jest.fn(),
        })),
    }
})
