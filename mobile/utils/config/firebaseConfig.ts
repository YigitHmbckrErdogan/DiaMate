import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
export const auth = Platform.OS === 'web' 
  ? getAuth(app) 
  : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
export const db = getFirestore(app);
