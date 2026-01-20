// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWb5qs7tTI5lIoN65n4y-0WYXO8fx9W7c",
  authDomain: "herittrust-608eb.firebaseapp.com",
  projectId: "herittrust-608eb",
  storageBucket: "herittrust-608eb.firebasestorage.app",
  messagingSenderId: "901272088982",
  appId: "1:901272088982:web:7f0ffe76c9b5660676edb7",
  measurementId: "G-7VZZS3Y0ZC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);