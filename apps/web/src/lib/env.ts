import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_BASE_URL: z.string().url(),
  APP_LOCALE: z.string().default("tr"),
  APP_TIMEZONE: z.string().default("Europe/Istanbul"),
  R2_PUBLIC_BASE_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  APP_BASE_URL: process.env.APP_BASE_URL,
  APP_LOCALE: process.env.APP_LOCALE,
  APP_TIMEZONE: process.env.APP_TIMEZONE,
  R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
});

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed. Check required variables.");
}

export const env = parsed.data;

