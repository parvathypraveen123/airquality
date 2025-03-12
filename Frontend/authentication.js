import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBw7PKLVobByYPvHQeFlcbQR6mBZ7u4toc",
    authDomain: "airscape-a562f.firebaseapp.com",
    projectId: "airscape-a562f",
    storageBucket: "airscape-a562f.firebasestorage.app",
    messagingSenderId: "777570095182",
    appId: "1:777570095182:web:d287c2cb26a159101df31f",
    measurementId: "G-KXZ86K01H1"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);