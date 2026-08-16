import { Injectable, signal } from '@angular/core';
import {
  Auth,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';

import { firebaseApp } from '../firebase-config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = getAuth(firebaseApp);

  currentUser = signal<User | null>(null);
  private authReady = signal(false);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      this.authReady.set(true);
    });
  }

  login(email: string, password: string): Promise<void> {
    return signInWithEmailAndPassword(this.auth, email, password).then(() => undefined);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    return user ? user.getIdToken() : null;
  }

  // Firebase met un court instant à vérifier si une session existe déjà (au rechargement de la page).
  // Cette méthode attend que cette vérification soit terminée avant de répondre.
  async waitUntilReady(): Promise<User | null> {
    if (this.authReady()) {
      return this.currentUser();
    }
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }
}