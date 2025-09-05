import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), "");
  const isProduction = mode === "production";
  // Default to mocks in non-production unless explicitly disabled.
  const useMocks = (
    fileEnv.VITE_MOCK_MODE ??
    process.env.VITE_MOCK_MODE ??
    (isProduction ? "false" : "true")
  ) === "true";

  return {
    server: {
      host: "::",
      port: 8080,
      headers: {
        // Prevent Clickjacking attacks
        "X-Frame-Options": "DENY",
        // Other security headers
        "X-Content-Type-Options": "nosniff",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy":
          "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
        // Allow WS for Vite HMR in dev; real CSP is served by backend/CDN in prod
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: ws:; media-src 'self' https://d2g8s4wkah5pic.cloudfront.net; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
        ...(isProduction && {
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        }),
      },
    },
    plugins: [react(), svgr()],
    resolve: {
      alias: [
        // Put more specific aliases first so they are matched before "@"
        ...(useMocks
          ? [
              { find: "@/utils/http", replacement: path.resolve(__dirname, "./src/mocks/http.ts") },
              { find: "@/apis/auth", replacement: path.resolve(__dirname, "./src/mocks/apis/auth.ts") },
              { find: "@mysten/dapp-kit", replacement: path.resolve(__dirname, "./src/mocks/mysten-dapp-kit.tsx") },
              { find: "@mysten/sui/client", replacement: path.resolve(__dirname, "./src/mocks/sui-client.ts") },
              { find: "@mysten/sui/transactions", replacement: path.resolve(__dirname, "./src/mocks/sui-transactions.ts") },
              { find: "@pythnetwork/pyth-sui-js", replacement: path.resolve(__dirname, "./src/mocks/pyth-sui-js.ts") },
            ]
          : []),
        { find: "@", replacement: path.resolve(__dirname, "./src") },
      ],
    },
  };
});
