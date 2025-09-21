import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbMusdCn2f_H2Ml8_W_qkLNsr7oqokR0Y",
  authDomain: "cement-control.firebaseapp.com",
  projectId: "cement-control",
  storageBucket: "cement-control.firebasestorage.app",
  messagingSenderId: "569753995759",
  appId: "1:569753995759:web:8f3768b75fe3df8e174e1a",
  measurementId: "G-ZH5L0Y1221",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
 
// const firebaseConfig = {
//   apiKey: "AIzaSyCbMusdCn2f_H2Ml8_W_qkLNsr7oqokR0Y",
//   authDomain: "cement-control.firebaseapp.com",
//   projectId: "cement-control",
//   storageBucket: "cement-control.firebasestorage.app",
//   messagingSenderId: "569753995759",
//   appId: "1:569753995759:web:8f3768b75fe3df8e174e1a",
//   measurementId: "G-ZH5L0Y1221"
// };
 
// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);