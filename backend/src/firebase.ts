// imports
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, CollectionReference, DocumentData } from 'firebase-admin/firestore'

const serviceAccount = require('./PATH_TO_YOUR_FIREBASE_INFO_JSON_FILE.json')

const firebaseApp = initializeApp({
  credential: cert(serviceAccount)
})
const firestore = getFirestore()
export const debts = firestore.collection('debts')
