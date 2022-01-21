import { initializeApp } from "firebase/app"
import {
    getAuth,
    GoogleAuthProvider,
    indexedDBLocalPersistence,
} from "firebase/auth"
import { getDatabase, onDisconnect, ref } from "firebase/database"

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const provider = new GoogleAuthProvider()
const auth = getAuth()
auth.setPersistence(indexedDBLocalPersistence)
const db = getDatabase(app)

const presenceRef = ref(db, "disconnectmessage")
onDisconnect(presenceRef)
    .remove()
    .catch((err) => {
        console.log("onDisconnect>", err)
        // const onLine = window.navigator.onLine
        // if (err) {
        //     console.log("code>", err.code)
        //     console.log("message>", err.message)
        // }
    })

export default { provider, auth, db }
