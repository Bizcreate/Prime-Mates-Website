/**
 * Centralised Pino logger.
 * - Avoids bundling/requiring `pino-pretty` in production (caused your error).
 * - Pretty output only in development; production logs are JSON.
 */
import pino from "pino"

const level = process.env.LOG_LEVEL || "info"
const isDev = process.env.NODE_ENV !== "production"

export function createLogger() {
  if (isDev) {
    // why: load pretty transport only in dev so Vercel prod doesn't need pino-pretty
    const transport = pino.transport({
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:standard", singleLine: true },
    })
    return pino({ level }, transport)
  }
  return pino({ level })
}

const logger = createLogger()
export default logger
