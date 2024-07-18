import { createApp } from 'vue'
import App from './App.vue'
import "../node_modules/bootstrap/dist/css/bootstrap.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle";
import $bus from './utils/Events'
import router from "./routes";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCcUo_1GSIxBDVQZRMIrwRIqtLIVx9E8NU",
  authDomain: "multidisciplinary-project-be.firebaseapp.com",
  projectId: "multidisciplinary-project-be",
  storageBucket: "multidisciplinary-project-be.appspot.com",
  messagingSenderId: "655958428923",
  appId: "1:655958428923:web:f511978bb9a6d481a0345e",
  measurementId: "G-Q1P4FJNEK2"
};

initializeApp(firebaseConfig);

const app = createApp(App)

app.use(router)

app.config.globalProperties.$bus = $bus

app.mount('#app')
