import { createClient } from "@base44/sdk";

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

let singletonClient: ReturnType<typeof createClient> | null = null;

export function getBase44Client() {
  if (singletonClient) {
    return singletonClient;
  }

  const appId = process.env.BASE44_APP_ID?.trim() || requiredEnv("VITE_APP_ID");
  const apiKey = requiredEnv("BASE44_API_KEY");

  singletonClient = createClient({
    appId,
    headers: {
      api_key: apiKey,
    },
  });

  return singletonClient;
}
