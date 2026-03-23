import { initializeApp, getApps, cert, applicationDefault, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) {
    return existing[0];
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    return initializeApp({
      credential: cert(serviceAccount),
    });
  }

  // Fall back to Application Default Credentials (Vercel/GCP environments)
  return initializeApp({
    credential: applicationDefault(),
  });
}

const adminApp: App = getAdminApp();
const adminAuth: Auth = getAuth(adminApp);

export { adminApp, adminAuth };
