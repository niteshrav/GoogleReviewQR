import { createHmac, timingSafeEqual } from "crypto";
import dns from "node:dns";
import https from "node:https";

// Windows / some ISPs resolve api.razorpay.com to broken IPv6 first; prefer IPv4.
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Older Node versions may not support this.
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string | null;
  status: string;
};

export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  vpa?: string | null;
  email?: string | null;
  contact?: string | null;
};

function requireKeys(): { keyId: string; keySecret: string } {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() ?? "";
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
  return { keyId, keySecret };
}

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim());
}

export function getRazorpayKeyId(): string {
  return requireKeys().keyId;
}

function authHeader(keyId: string, keySecret: string): string {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

function networkErrorMessage(error: unknown): string {
  const err = error as { message?: string; code?: string; cause?: { message?: string; code?: string } };
  const cause = err?.cause?.message || err?.cause?.code || err?.code;
  const base = err?.message || "Network error talking to Razorpay";
  if (cause && cause !== base) {
    return `${base} (${cause}). Check internet / firewall, then retry.`;
  }
  if (base.toLowerCase().includes("fetch failed")) {
    return "Could not reach Razorpay (fetch failed). Check internet connection and try again.";
  }
  return base;
}

type RazorpayHttpResult = {
  status: number;
  body: string;
};

/** Prefer Node https over undici fetch — more reliable on Windows for Razorpay. */
function razorpayRequest(
  method: "GET" | "POST",
  pathName: string,
  body?: Record<string, unknown>,
): Promise<RazorpayHttpResult> {
  const { keyId, keySecret } = requireKeys();
  const payload = body ? JSON.stringify(body) : undefined;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.razorpay.com",
        path: pathName,
        method,
        family: 4,
        headers: {
          Authorization: authHeader(keyId, keySecret),
          Accept: "application/json",
          ...(payload
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
              }
            : {}),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on("end", () => {
          resolve({
            status: res.statusCode ?? 0,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );

    req.setTimeout(30_000, () => {
      req.destroy(new Error("Razorpay request timed out"));
    });

    req.on("error", (error) => {
      reject(new Error(networkErrorMessage(error)));
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

export async function createRazorpayOrder(input: {
  amountInr: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const amountPaise = Math.round(input.amountInr * 100);

  if (amountPaise < 100) {
    throw new Error("Minimum payable amount is ₹1");
  }

  let result: RazorpayHttpResult;
  try {
    result = await razorpayRequest("POST", "/v1/orders", {
      amount: amountPaise,
      currency: "INR",
      receipt: input.receipt.slice(0, 40),
      notes: input.notes ?? {},
    });
  } catch (error) {
    throw new Error(networkErrorMessage(error));
  }

  const data = JSON.parse(result.body || "{}") as RazorpayOrder & {
    error?: { description?: string; code?: string };
  };

  if (result.status < 200 || result.status >= 300 || !data?.id) {
    const detail = data?.error?.description || data?.error?.code;
    throw new Error(detail ?? `Could not create Razorpay order (HTTP ${result.status})`);
  }

  return {
    id: data.id,
    amount: data.amount,
    currency: data.currency,
    receipt: data.receipt,
    status: data.status,
  };
}

export async function fetchRazorpayPayment(paymentId: string): Promise<RazorpayPayment> {
  let result: RazorpayHttpResult;
  try {
    result = await razorpayRequest("GET", `/v1/payments/${encodeURIComponent(paymentId)}`);
  } catch (error) {
    throw new Error(networkErrorMessage(error));
  }

  const data = JSON.parse(result.body || "{}") as RazorpayPayment & {
    error?: { description?: string };
  };

  if (result.status < 200 || result.status >= 300 || !data?.id) {
    throw new Error(data?.error?.description ?? "Could not fetch Razorpay payment");
  }

  return data;
}

export function verifyRazorpayPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = requireKeys();
  const payload = `${input.orderId}|${input.paymentId}`;
  const expected = createHmac("sha256", keySecret).update(payload).digest("hex");

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(input.signature.trim(), "utf8");
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function mapRazorpayMethod(method: string): "upi" | "card" | "netbanking" | "wallet" | "razorpay" {
  if (method === "upi" || method === "card" || method === "netbanking" || method === "wallet") {
    return method;
  }
  return "razorpay";
}
