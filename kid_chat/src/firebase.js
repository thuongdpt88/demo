import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD_a5ykUzFClrzJalmql4vs_6TPE5WYLqQ",
  authDomain: "ai-demo-64219.firebaseapp.com",
  projectId: "ai-demo-64219",
  storageBucket: "ai-demo-64219.firebasestorage.app",
  messagingSenderId: "14008379823",
  appId: "1:14008379823:web:1350b9cb75cef1d783275a",
  databaseURL: "https://ai-demo-64219-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export default app;
