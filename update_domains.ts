import { GoogleAuth } from "google-auth-library";
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };

async function main() {
  const projectId = firebaseConfig.projectId;
  console.log(`Starting authorized domains update for project: ${projectId}`);

  // Initialize google auth
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"]
  });
  
  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();
  const token = accessTokenResponse.token;

  if (!token) {
    throw new Error("Failed to get Google OAuth access token.");
  }

  const url = `https://identitytoolkit.googleapis.com/v2/projects/${projectId}/config`;

  // 1. Get current config
  console.log("Fetching current configuration...");
  const getRes = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-goog-user-project": projectId
    }
  });

  if (!getRes.ok) {
    const errorText = await getRes.text();
    throw new Error(`Failed to fetch current config: ${getRes.status} ${getRes.statusText}\n${errorText}`);
  }

  const currentConfig = await getRes.json();
  console.log("Current authorized domains:", currentConfig.authorizedDomains);

  const existingDomains: string[] = currentConfig.authorizedDomains || [];
  
  // 2. Add new domains
  const newDomains = [
    "teenlaunch.netlify.app",
    "6a40fe7de9f4f533dc270200--teenlaunch.netlify.app"
  ];

  let changed = false;
  const updatedDomains = [...existingDomains];

  for (const domain of newDomains) {
    if (!updatedDomains.includes(domain)) {
      updatedDomains.push(domain);
      changed = true;
    }
  }

  if (!changed) {
    console.log("All requested domains are already authorized. No changes needed.");
    return;
  }

  console.log("New list of authorized domains to set:", updatedDomains);

  // 3. PATCH the config
  console.log("Updating configuration with new authorized domains...");
  const patchUrl = `${url}?updateMask=authorizedDomains`;
  const patchRes = await fetch(patchUrl, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-goog-user-project": projectId
    },
    body: JSON.stringify({
      authorizedDomains: updatedDomains
    })
  });

  if (!patchRes.ok) {
    const errorText = await patchRes.text();
    throw new Error(`Failed to update config: ${patchRes.status} ${patchRes.statusText}\n${errorText}`);
  }

  const updatedConfig = await patchRes.json();
  console.log("Successfully updated configuration!");
  console.log("Updated authorized domains:", updatedConfig.authorizedDomains);
}

main().catch(err => {
  console.error("Error occurred:", err);
  process.exit(1);
});
