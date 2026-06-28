import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

let app;
try {
  app = getApps().length ? getApps()[0] : initializeApp({
    projectId: firebaseConfig.projectId,
  });
  console.log("Firebase Admin initialized successfully.");
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
  throw error;
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
