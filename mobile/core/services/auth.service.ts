import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase-config';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export function register(email: string, password: string): Promise<User> {
  return createUserWithEmailAndPassword(auth, email, password).then((c) => c.user);
}
export function login(email: string, password: string): Promise<User> {
  return signInWithEmailAndPassword(auth, email, password).then((c) => c.user);
}

export function logout(): Promise<void> {
  return signOut(auth);
}

export function observeAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getIdToken(): Promise<string | null> {
  return auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null);
}