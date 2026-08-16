import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBt3yoOs9uoc9xL0abxdYKfBwndc4EKIuI',
  authDomain: 'solar-smart-parking-hub.firebaseapp.com',
  projectId: 'solar-smart-parking-hub',
  storageBucket: 'solar-smart-parking-hub.firebasestorage.app',
  messagingSenderId: '727141452768',
  appId: '1:727141452768:web:cc0a2de77d319a4219b985',
};

export const firebaseApp = initializeApp(firebaseConfig);