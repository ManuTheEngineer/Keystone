import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.database();

const PLAN_LIMITS: Record<string, number> = {
  FOUNDATION: 10,
  BUILDER: 50,
  DEVELOPER: 9999,
  ENTERPRISE: 9999,
};

export const aiUsage = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Verify Firebase Auth token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.split("Bearer ")[1];
  let uid: string;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  // Read user plan
  const profileSnap = await db.ref(`users/${uid}`).get();
  const plan = profileSnap.exists() ? profileSnap.val().plan : "FOUNDATION";
  const limit = PLAN_LIMITS[plan] ?? 10;

  // Read today's usage
  const today = new Date().toISOString().split("T")[0];
  const usageSnap = await db.ref(`aiUsage/${uid}/${today}`).get();
  const used = usageSnap.exists() ? usageSnap.val().count : 0;

  res.json({
    used,
    limit,
    remaining: Math.max(0, limit - used),
    plan,
    date: today,
  });
});
