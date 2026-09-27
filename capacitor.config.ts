import type { CapacitorConfig } from "@capacitor/cli";

// IMPORTANT: replace both values below before the real App Store submission.
// - appId must match the Bundle Identifier you register in App Store Connect.
// - server.url must point at the live deployed app (Vercel URL or your own domain).
const config: CapacitorConfig = {
  appId: "com.san3.app",
  appName: "سنع",
  webDir: "public",
  server: {
    url: "https://sanea-app-jade.vercel.app",
    cleartext: false,
  },
  ios: {
    contentInset: "never",
  },
};

export default config;
