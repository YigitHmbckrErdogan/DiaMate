import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAHA8tG8LxV4sOnllMIXYt5oSoyPSyaY7A",
  authDomain: "diamate-58bda.firebaseapp.com",
  projectId: "diamate-58bda",
  storageBucket: "diamate-58bda.firebasestorage.app",
  messagingSenderId: "678860788141",
  appId: "1:678860788141:web:91439b6953cf839ec19124"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export instances
export const auth = getAuth(app);
export const db = getFirestore(app);
