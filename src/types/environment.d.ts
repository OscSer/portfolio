declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production"
            AUTH0_DOMAIN: string
            AUTH0_CLIENT_ID: string
            API_RC_DOMAIN: string
            APIKEY_MICRO_SERVICES: string
            AUTH0_KEY_USER_CATALOG: string
        }
    }
}

export {}
