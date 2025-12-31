/* Project Logic: Notification Fix */
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyBzwhpHmeZdLf_nZrcPQirlnpj3Vhg9EqA",
  projectId: "thripudilibrary",
  messagingSenderId: "887018912750",
  appId: "1:887018912750:web:cc05190a72b13db816acff"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  // സന്ദേശം വരുന്നുണ്ടോ എന്ന് കൺസോളിൽ നോക്കാം
  console.log('Message Received:', payload);
  return self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: 'assets/cover/logo.png'
  });
});