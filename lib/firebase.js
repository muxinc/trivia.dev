export default async function initialize() {
  const firebase = await import('firebase');
  const authProvider = new firebase.auth.GithubAuthProvider();

  const auth = firebase
    .auth()
    .setPersistence(firebase.auth.Auth.Persistence.SESSION);

  try {
    firebase.initializeApp({
      databaseURL: 'https://devtrivia-af707.firebaseio.com',
    });
  } catch (err) {
    // we skip the "already exists" message which is
    // not an actual error when we're hot-reloading
    if (!/already exists/.test(err.message)) {
      console.error('Firebase initialization error', err.stack);
    }
  }

  return {
    database: firebase.database().ref('v0'),
    authProvider: authProvider,
    auth: auth,
  };
}
