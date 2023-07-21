import * as firebase from 'firebase'
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

var firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "PROJECT_ID",
  storageBucket: "STORAGE_BUCKET", 
  messagingSenderId: "YOUR_MESSAGE_SEND_ID",
  appId: "YOUR_APP_ID"
}

firebase
  .initializeApp(firebaseConfig)
  .firestore()

// Init Firebase
let app;
if (firebase.apps.length === 0) {
    app = firebase.initializeApp(firebaseConfig);
} else {
    app = firebase.app()
}

const auth = firebase.auth()
const db = firebase.firestore();

// EXPORTS
export { auth, db }