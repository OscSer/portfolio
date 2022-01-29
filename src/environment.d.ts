declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production"
            FIREBASE_API_KEY: string
            FIREBASE_AUTH_DOMAIN: string
            FIREBASE_PROJECT_ID: string
            FIREBASE_STORAGE_BUCKET: string
            FIREBASE_MESSAGING_SENDER_ID: string
            FIREBASE_APP_ID: string
            AMERITRADE_API_KEY: string
        }
    }
}
export {}
