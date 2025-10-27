import { env } from "@/lib/env";

export const siteConfig = {
  name: "Rüya Tabiri",
  locale: env.APP_LOCALE ?? "tr",
  baseUrl: env.APP_BASE_URL,
  timezone: env.APP_TIMEZONE,
  cdnBaseUrl: env.R2_PUBLIC_BASE_URL,
};

