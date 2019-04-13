export default async function initialize() {
  const firebase = await import('firebase');

  try {
    firebase.initializeApp({
      apiKey: 'AIzaSyBUzCZ8qTBgIw1QeTHWvMXclto9R01e8rM',
      authDomain: 'devtrivia-af707.firebaseapp.com',
      databaseURL: 'https://devtrivia-af707.firebaseio.com',
      projectId: 'devtrivia-af707',
      storageBucket: 'devtrivia-af707.appspot.com',
      messagingSenderId: '573681181831',
    });
  } catch (err) {
    // we skip the "already exists" message which is
    // not an actual error when we're hot-reloading
    if (!/already exists/.test(err.message)) {
      console.error('Firebase initialization error', err.stack);
    }
  }

  return {
    firebase,
    db: firebase.firestore(),
    // db: firebase.database().ref('v0'),
  };
}
