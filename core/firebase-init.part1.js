// Firebase init — обычный (не module) скрипт с динамическим import: работает и с file://, и на GitHub Pages
(async function () {
  const V = 'https://www.gstatic.com/firebasejs/10.12.0/';
  try {
    const [A, D, U] = await Promise.all([import(V + 'firebase-app.js'), import(V + 'firebase-database.js'), import(V + 'firebase-auth.js')]);
    const firebaseConfig = {
      apiKey: "AIzaSyBeWnKv5BT5XuNPskjj1uHWsY87Y1rROcc",
      authDomain: "supernatural-english.firebaseapp.com",
      databaseURL: "https://supernatural-english-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "supernatural-english",
      storageBucket: "supernatural-english.firebasestorage.app",
      messagingSenderId: "859374946868",
      appId: "1:859374946868:web:988203782b825e736b5861",
      measurementId: "G-6D6BTBJXCZ"
    };
    const app = A.initializeApp(firebaseConfig), db = D.getDatabase(app), auth = U.getAuth(app);
    const { ref, set, get, update, remove, onValue, onDisconnect, serverTimestamp, push } = D;
    window.__FB = { app, db, auth, ref, set, get, update, remove, onValue, onDisconnect, serverTimestamp, push };
    U.signInAnonymously(auth).then(() => console.log('🔥 Firebase auth OK')).catch(e => console.error('❌ Auth error:', e));
  } catch (e) { console.error('❌ Firebase не загрузился (нет интернета?):', e); }
})();
