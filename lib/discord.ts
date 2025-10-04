// lib/discord.ts
/**
 * Tiny helper to post messages to a Discord webhook.
 * Safe to import from server code (e.g., route handlers).
 */
export async function postToDiscord(webhookUrl: string, message: string) {
    if (!webhookUrl) return; // no-op if not configured
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: message }),
        // don't cache webhook calls
        cache: "no-store",
      });
    } catch (e) {
      // swallow errors so a failed Discord call never breaks your API route
      console.error("[discord] post error:", e);
    }
  }
  