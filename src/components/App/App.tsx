import "./App.scss"
import { FirebaseService } from "@services"
import { signInWithRedirect, onAuthStateChanged, signOut } from "firebase/auth"
import { useEffectOnce } from "react-use"
import { useUser } from "@hooks"

function App(): JSX.Element {
    const [user, setUser] = useUser()
    const { auth, provider } = FirebaseService

    useEffectOnce(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user)
            } else {
                signInWithRedirect(auth, provider)
            }
        })
    })

    const handleSignOut = () => {
        setUser(undefined)
        signOut(auth)
    }

    return user ? (
        <div>
            <h1>{user.displayName}</h1>
            <h1>{user.email}</h1>
            <button onClick={handleSignOut}>SignOut</button>
        </div>
    ) : (
        <h1>Loading...</h1>
    )
}

export { App }
