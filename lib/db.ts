import { neon } from "@neondatabase/serverless"

// Ensure DATABASE_URL is set in your environment variables
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set.")
}

export const sql = neon(databaseUrl)
