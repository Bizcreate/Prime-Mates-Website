const WOOC_URL =
  process.env.WOOCOMMERCE_URL ||
  process.env.WOO_BASE_URL ||
  "";

const WOOC_KEY =
  process.env.WOOCOMMERCE_CONSUMER_KEY ||
  process.env.WOO_CONSUMER_KEY ||
  "";

const WOOC_SECRET =
  process.env.WOOCOMMERCE_CONSUMER_SECRET ||
  process.env.WOO_CONSUMER_SECRET ||
  "";

/** Build a Woo REST URL with fallback query auth (helps when Basic is blocked). */
function urlWithAuth(path: string, params: Record<string, string | number | undefined> = {}) {
  const u = new URL(`${WOOC_URL.replace(/\/+$/, "")}/wp-json/wc/v3${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  });
  // add consumer key/secret as query as a fallback (many hosts allow this)
  u.searchParams.set("consumer_key", WOOC_KEY);
  u.searchParams.set("consumer_secret", WOOC_SECRET);
  return u.toString();
}

/** Basic auth header (some hosts accept, some block; we send both just in case). */
function basicAuthHeader() {
  const token = Buffer.from(`${WOOC_KEY}:${WOOC_SECRET}`).toString("base64");
  return `Basic ${token}`;
}

export async function wooFetch<T = any>(
  path: string,
  params?: Record<string, string | number | undefined>,
  init?: RequestInit
): Promise<T> {
  if (!WOOC_URL || !WOOC_KEY || !WOOC_SECRET) {
    throw new Error("WooCommerce environment variables are not set.");
  }

  const res = await fetch(urlWithAuth(path, params), {
    // Try Basic too:
    headers: { Authorization: basicAuthHeader() },
    cache: "no-store",
    ...init,
  });

  const text = await res.text();
  let json: any;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }

  if (!res.ok) {
    const msg = json?.message || json?.error || `Woo request failed (${res.status})`;
    throw new Error(msg);
  }
  return json as T;
}
