import admin from "firebase-admin";

import serviceAccount from "./canteen-3d920-d2c1f3382245.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Export the messaging service
export const messaging = admin.messaging();


export default admin;