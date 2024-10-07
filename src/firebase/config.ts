import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBDLc6A9aDx_aDrzTvSM7vGWgeRHL7iNrs",
  authDomain: "cursor1-3d6a4.firebaseapp.com",
  projectId: "cursor1-3d6a4",
  storageBucket: "cursor1-3d6a4.appspot.com",
  messagingSenderId: "466560668385",
  appId: "1:466560668385:web:42df2408ce9cde8c005da0",
  measurementId: "G-H5LN3JTPNH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);