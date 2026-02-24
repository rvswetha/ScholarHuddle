import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// This is a little helper to find the file relative to this one
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the path to the JSON file
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || join(__dirname, 'firebase-service-account.json');
try {
  // Read and parse the JSON file
  // If the file is in server/src/config/
  const serviceAccount = JSON.parse(
    readFileSync(new URL('./firebase-service-account.json', import.meta.url))
  );
  // Initialize the app
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log("Firebase Admin SDK initialized successfully.");

} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
}

export default admin;