import { db, auth } from './firebase.js';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc,
  setDoc, getDoc,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from 'firebase/auth';

// ---- Authentification (administrateur du club) ----
export function listenAuth(callback) {
  return onAuthStateChanged(auth, (user) => callback(user));
}
export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export async function logout() {
  return signOut(auth);
}

// ---- Collections ----
export const swimmersCol = collection(db, 'swimmers');
export const meetingsCol = collection(db, 'meetings');
export const entriesCol = collection(db, 'entries');
export const eventsCol = collection(db, 'events');
export const resultsCol = collection(db, 'results');
const settingsDoc = doc(db, 'settings', 'app');

// ---- Écoute en temps réel d'une collection ----
export function listen(col, callback) {
  return onSnapshot(col, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  }, (err) => {
    console.error('Erreur de synchronisation Firestore', err);
  });
}

export function listenCurrentMeeting(callback) {
  return onSnapshot(settingsDoc, (snap) => {
    callback(snap.exists() ? snap.data().currentMeeting || null : null);
  }, (err) => {
    console.error('Erreur de synchronisation Firestore', err);
  });
}

export async function setCurrentMeeting(id) {
  await setDoc(settingsDoc, { currentMeeting: id }, { merge: true });
}

// ---- CRUD génériques ----
export async function addItem(col, data) {
  return addDoc(col, data);
}
export async function updateItem(col, id, data) {
  return updateDoc(doc(col, id), data);
}
export async function deleteItem(col, id) {
  return deleteDoc(doc(col, id));
}
