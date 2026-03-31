import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

// 🔥 YOUR CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyC5ymgsIRCkNubgOXQr6K5RnEwg2DlJ-xQ",
  authDomain: "smart-locker-924d4.firebaseapp.com",
  projectId: "smart-locker-924d4",
  storageBucket: "smart-locker-924d4.appspot.com",
  messagingSenderId: "627217512653",
  appId: "1:627217512653:web:5f97e67320f04fd0f19184"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

export { app, db, storage, rtdb };
