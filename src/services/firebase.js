import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyCUlURbPgVucJZlUeFs7vj1_HRINgButaA",
  authDomain: "smw-speedrun-mobile-lederbord.firebaseapp.com",
  databaseURL: "https://smw-speedrun-mobile-lederbord-default-rtdb.firebaseio.com/",
  projectId: "smw-speedrun-mobile-lederbord",
  storageBucket: "smw-speedrun-mobile-lederbord.firebasestorage.app",
  messagingSenderId: "938362959999",
  appId: "1:938362959999:web:50ac271e89704ec3bce74a"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const database = getDatabase(app)
export default app
