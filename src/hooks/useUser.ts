import { User } from "firebase/auth"
import { createGlobalState } from "react-use"

const useUser = createGlobalState<User>()
export { useUser }
