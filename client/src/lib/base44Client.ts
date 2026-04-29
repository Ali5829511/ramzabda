import { createClient } from "@base44/sdk";

const appId = import.meta.env.VITE_BASE44_APP_ID || import.meta.env.VITE_APP_ID;
const apiKey = import.meta.env.VITE_BASE44_API_KEY;

if (!appId) {
  throw new Error("VITE_BASE44_APP_ID (or VITE_APP_ID) is required for Base44 client");
}

const base44 = createClient({
  appId,
  headers: apiKey
    ? {
        api_key: apiKey,
      }
    : undefined,
});

export default base44;
