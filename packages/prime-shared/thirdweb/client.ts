// packages/prime-shared/thirdweb/client.ts
import { createThirdwebClient } from "thirdweb";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!clientId && typeof window !== "undefined") {
  console.warn("NEXT_PUBLIC_THIRDWEB_CLIENT_ID is missing. Add it to .env.local");
}

export const thirdwebClient = createThirdwebClient({
  clientId: clientId ?? "MISSING_CLIENT_ID",
});
