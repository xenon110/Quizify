import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "studio-4039051233-a2297",
  "appId": "1:994271979570:web:056a5e12bb680dc6bcf42b",
  "apiKey": "AIzaSyBx4sGoTnLMjhcA7ZHRS6B0CtDAF8YyX94",
  "authDomain": "studio-4039051233-a2297.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "994271979570"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
