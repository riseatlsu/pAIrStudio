// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwycxqIMT3KjFMlkVeN9-OnfQJwqhOUKw",
  authDomain: "mike-studio-experiment-v1.firebaseapp.com",
  projectId: "mike-studio-experiment-v1",
  storageBucket: "mike-studio-experiment-v1.firebasestorage.app",
  messagingSenderId: "395845986498",
  appId: "1:395845986498:web:654882f6516f308db2f35b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUserId = null;
let currentCondition = null;

async function initExperiment() {
  try {
    const userCredential = await signInAnonymously(auth);
    currentUserId = userCredential.user.uid;
    console.log("Connected to experiment. User ID:", currentUserId);

    // Assign condition
    currentCondition = Math.random() < 0.5 ? 'experimental' : 'control';

    // Save metadata
    await setDoc(doc(db, "participants", currentUserId), {
      condition: currentCondition,
      startTime: serverTimestamp(),
      userAgent: navigator.userAgent
    });

    // Make the condition available globally if your UI needs to change
    window.experimentCondition = currentCondition;
    
    console.log("Condition assigned:", currentCondition);

  } catch (error) {
    console.error("Firebase connection error:", error);
  }
}

// --- THE EXPORTED FUNCTION ---
// We attach this to 'window' so you can call it from anywhere in your app
window.logRunEvent = async function(userCode, simulationResult) {
  if (!currentUserId) return; 

  try {
    await addDoc(collection(db, `participants/${currentUserId}/logs`), {
      eventType: "run_simulation",
      codeSnapshot: userCode,
      output: simulationResult,
      timestamp: serverTimestamp(),
      localTime: new Date().toISOString()
    });
    console.log("Logged run event.");
  } catch (e) {
    console.error("Logging error: ", e);
  }
}

// Auto-start connection when this script loads
initExperiment();