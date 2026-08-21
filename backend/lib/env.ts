import { z } from "zod";
import { loadRootEnv } from "@backend/lib/load-root-env";

loadRootEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  BASE_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  ADMIN_SECRET: z.string().min(16),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().optional().default(""),
  SMTP_FROM: z.string().min(1),
  ALERT_EMAIL_MODE: z.enum(["live", "log"]).default("live"),
  RATE_LIMIT_PAGE_VIEWS_MAX: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_PAGE_VIEWS_WINDOW_SECONDS: z.coerce.number().int().positive().default(3600),
  RATE_LIMIT_FEEDBACK_MAX: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_FEEDBACK_WINDOW_SECONDS: z.coerce.number().int().positive().default(3600),
  COMMENT_MAX_CHARS: z.coerce.number().int().positive().max(5000).default(1000),
  ALERT_PHONE_MODE: z.enum(["log", "twilio"]).default("log"),
  CRON_SECRET: z.string().optional(),
  UPI_VPA: z.string().optional().default(""),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_SMS_FROM: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) {
    return cached;
  }

  loadRootEnv();

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${message}`);
  }

  cached = parsed.data;
  return cached;
}

export function getPublicBaseUrl(): string {
  return getEnv().BASE_URL.replace(/\/$/, "");
}

export function resetEnvCacheForTests(): void {
  cached = null;
}
