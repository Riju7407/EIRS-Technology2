import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBRIxGWuRc4gTHUIqIU_LgsWzwd48q8f84",
  authDomain: "eirs2-ad4ff.firebaseapp.com",
  projectId: "eirs2-ad4ff",
  storageBucket: "eirs2-ad4ff.firebasestorage.app",
  messagingSenderId: "193374206761",
  appId: "1:193374206761:web:c8571ba861ea757cfd5538"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

