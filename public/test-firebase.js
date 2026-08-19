const firebase = require('firebase/app');
require('firebase/firestore');
require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyBnwUPeq0w7L4ddRV1Icmi6LTEfQfPS0OY",
    authDomain: "janemarket-official.firebaseapp.com",
    projectId: "janemarket-official",
    storageBucket: "janemarket-official.firebasestorage.app",
    messagingSenderId: "182162307433",
    appId: "1:182162307433:web:5af78a086019f352c0e5f8",
    measurementId: "G-E6SE8MZR27"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

async function test() {
    console.log("Testing Firestore SDK...");
    try {
        const snap = await db.collection("products").get();
        console.log("SUCCESS! Got docs count:", snap.docs.length);
    } catch(err) {
        console.error("SDK Error code:", err.code);
        console.error("SDK Error message:", err.message);
    }
    process.exit(0);
}

test();
