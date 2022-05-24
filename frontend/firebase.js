import * as firebase from 'firebase'
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

var firebaseConfig = {
  apiKey: "AIzaSyBnoXWzm92fEYcR5nEJYVSEt8rP3WfxVvk",
  authDomain: "iou-poker-development.firebaseapp.com",
  projectId: "iou-poker-development",
  storageBucket: "iou-poker-development.appspot.com", 
  messagingSenderId: "308689079238",
  appId: "1:308689079238:web:a9569a7579258c5d2740c7"
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