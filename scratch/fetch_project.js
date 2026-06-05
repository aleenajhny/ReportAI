const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Parse env variables from .env.local
const envPath = path.join(__dirname, '..', 'frontend', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});
Object.assign(process.env, env);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function findProject() {
  console.log("Searching for project haKtUQYBHOPmxyZVVoPK in Firestore...");
  // Since we cannot list root collections in web SDK directly, we can try to query common paths or search.
  // Wait, the project ID is haKtUQYBHOPmxyZVVoPK.
  // Can we just fetch users collection if there is a known user list?
  // Usually, users contains user documents. Let's try to list users.
  try {
    const usersCol = collection(db, "users");
    const usersSnap = await getDocs(usersCol);
    console.log("Found users count:", usersSnap.size);
    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const projCol = collection(db, "users", userId, "projects");
      const projSnap = await getDocs(projCol);
      for (const projDoc of projSnap.docs) {
        if (projDoc.id === "haKtUQYBHOPmxyZVVoPK" || projDoc.id === "KI7VhzpS3SOoeCpZ2xM3") {
          console.log(`FOUND project ${projDoc.id} under user ${userId}!`);
          console.log("Project Data:", JSON.stringify(projDoc.data(), null, 2));
          return;
        }
      }
    }
    console.log("Project not found in users.");
  } catch (error) {
    console.error("Error finding project:", error);
  }
}

findProject();
