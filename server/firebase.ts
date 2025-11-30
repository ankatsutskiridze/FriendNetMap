import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Initialize Firebase Admin
// We will look for a serviceAccountKey.json file in the root directory
// OR use environment variables if provided

let serviceAccount: any;

try {
  // Try to load from file
  const serviceAccountPath = path.resolve(
    process.cwd(),
    "serviceAccountKey.json"
  );
  if (fs.existsSync(serviceAccountPath)) {
    const content = fs.readFileSync(serviceAccountPath, "utf8");
    serviceAccount = JSON.parse(content);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Try to load from env var (useful for production/Render)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
} catch (error) {
  console.error("Error loading Firebase service account:", error);
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin initialized successfully");
} else {
  console.warn(
    "Firebase Admin NOT initialized. Missing serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT env var."
  );
}

export const firebaseAdmin = admin;
export const verifyIdToken = async (token: string) => {
  if (!serviceAccount) {
    throw new Error("Firebase Admin not initialized");
  }
  return admin.auth().verifyIdToken(token);
};
