// Firebase initialization — only runs if VITE_FIREBASE_API_KEY is set.
// Never hard-code credentials here.

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  type Firestore,
} from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;

export const IS_FIREBASE = Boolean(apiKey);

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

if (IS_FIREBASE) {
  _app = initializeApp({
    apiKey,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  });
  _auth = getAuth(_app);
  _db   = getFirestore(_app);
}

export const firebaseAuth = _auth;
export const db           = _db;
