import firebase from "firebase/app"
import "firebase/database"

const firebase_app = firebase.initializeApp({
  // Your Firebase configuration here
})

const db = firebase_app.database()

export default firebase_app
export { db }

// ... rest of code here ...
