// --------- FIREBASE SETUP ---------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCeX1P32dBLxF038NTZZAM-j4XMhij-HPw",
  authDomain: "sales-tracker-9c535.firebaseapp.com",
  projectId: "sales-tracker-9c535",
  storageBucket: "sales-tracker-9c535.firebasestorage.app",
  messagingSenderId: "829925343272",
  appId: "1:829925343272:web:6db6cc055f2e9f684eb51d",
  measurementId: "G-P1SSFVYDYJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --------- FORM SUBMISSION ---------
document.getElementById("leadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const leadName = document.getElementById("leadName").value;
    const leadContact = document.getElementById("leadContact").value;
    const outcome = document.getElementById("outcome").value;
    const rep = document.getElementById("rep").value;

    try {
        await addDoc(collection(db, "leads"), {
            leadName: leadName,
            leadContact: leadContact,
            outcome: outcome,
            rep: rep,
            timestamp: serverTimestamp()
        });

        document.getElementById("statusMessage").innerText = "Saved!";
        document.getElementById("leadForm").reset();

    } catch (error) {
        document.getElementById("statusMessage").innerText = "Error saving!";
        console.error(error);
    }
});
