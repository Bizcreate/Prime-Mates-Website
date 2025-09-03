import { createThirdwebClient } from "thirdweb"

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "30b0a2d7a206d41a5bfc150d57f5bee0"
const secretKey = process.env.THIRDWEB_SECRET_KEY

export const client = createThirdwebClient(secretKey ? { secretKey } : { clientId })
