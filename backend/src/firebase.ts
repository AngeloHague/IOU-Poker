// imports
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, CollectionReference, DocumentData } from 'firebase-admin/firestore'

// config
// var firebaseConfig = {
//   apiKey: "AIzaSyBnoXWzm92fEYcR5nEJYVSEt8rP3WfxVvk",
//   authDomain: "iou-poker-development.firebaseapp.com",
//   projectId: "iou-poker-development",
//   storageBucket: "iou-poker-development.appspot.com", 
//   messagingSenderId: "308689079238",
//   appId: "1:308689079238:web:a9569a7579258c5d2740c7"
// }

// exports
// export const firebaseApp = initializeApp(firebaseConfig)
// export const firestore = getFirestore()

// // This is just a helper to add the type to the db responses
// const createCollection = <T = DocumentData>(collectionName: string) => {
//   return collection(firestore, collectionName) as CollectionReference<T>
// }

const serviceAccount = require('./iou-poker-development-0a86c40dbff2.json')

const firebaseApp = initializeApp({
  credential: cert(serviceAccount)
})
const firestore = getFirestore()
export const debts = firestore.collection('debts')