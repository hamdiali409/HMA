importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAnMzwwJZ_P1z0k5MjFv9XsQJHFAEaCwV8",
  authDomain: "gen-lang-client-0289564071.firebaseapp.com",
  projectId: "gen-lang-client-0289564071",
  storageBucket: "gen-lang-client-0289564071.firebasestorage.app",
  messagingSenderId: "1067457848066",
  appId: "1:1067457848066:web:e2baa38e68c771de3b581b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
