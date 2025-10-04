// lib/discord.ts
type DiscordEmbed = {
    title?: string;
    description?: string;
    url?: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    timestamp?: string;
    footer?: { text: string; icon_url?: string };
    thumbnail?: { url: string };
    image?: { url: string };
  };
  
  export type DiscordWebhookPayload = {
    content?: string;
    username?: string;
    avatar_url?: string;
    embeds?: DiscordEmbed[];
  };
  
  export async function sendDiscord(
    payload: DiscordWebhookPayload,
    options?: { url?: string }
  ) {
    const url =
      options?.url ||
      process.env.DISCORD_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;
  
    if (!url) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[discord] No DISCORD_WEBHOOK_URL set – skipping webhook send.");
      }
      return { ok: false as const, skipped: true as const };
    }
  
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`[discord] Webhook failed: ${res.status} ${res.statusText} ${text}`);
    }
  
    return { ok: true as const };
  }
  