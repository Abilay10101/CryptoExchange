import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDa7AtQo8oRM9BdM0pDuEbAo_pNLtKiSL0",
  authDomain: "cryptopr-ea6c7.firebaseapp.com",
  projectId: "cryptopr-ea6c7",
  storageBucket: "cryptopr-ea6c7.firebasestorage.app",
  messagingSenderId: "891509049613",
  appId: "1:891509049613:web:2c7b8042a8350a72e14844"
};

// Initialize Firebase with error handling
let auth, db;
try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser doesn\'t support offline persistence');
    }
  });
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { auth, db };