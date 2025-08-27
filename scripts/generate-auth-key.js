const crypto = require("crypto")

// Generate a random 32-byte private key
const privateKey = crypto.randomBytes(32).toString("hex")

console.log("Generated AUTH_PRIVATE_KEY:")
console.log(`0x${privateKey}`)
console.log("\nAdd this to your environment variables:")
console.log(`AUTH_PRIVATE_KEY=0x${privateKey}`)

// Also generate the corresponding public address for reference
const { createWalletClient, http } = require("viem")
const { privateKeyToAccount } = require("viem/accounts")
const { mainnet } = require("viem/chains")

try {
  const account = privateKeyToAccount(`0x${privateKey}`)
  console.log(`\nCorresponding wallet address: ${account.address}`)
  console.log("(This address is for reference only - no funds needed)")
} catch (error) {
  console.log("\nPrivate key generated successfully!")
}
