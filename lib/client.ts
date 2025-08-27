import { createThirdwebClient } from "thirdweb"

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "053f689d02c509dbd4ddac25f35a002b"
const secretKey = process.env.THIRDWEB_SECRET_KEY // only present on server

export const client = createThirdwebClient(secretKey ? { secretKey } : { clientId })
