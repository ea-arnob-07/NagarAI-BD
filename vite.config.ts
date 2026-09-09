import vinext from "vinext";
import { defineConfig } from "vite";
import { nagaraiPlugin } from "./build/nagarai-vite-plugin";

const LOCAL_D1_DATABASE_ID = "00000000-0000-4000-8000-000000000000";

export default defineConfig(async ({ command, mode }) => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  const isDev = command === "serve" || mode === "development";
  const d1DatabaseId = process.env.D1_DATABASE_ID || (isDev ? LOCAL_D1_DATABASE_ID : undefined);

  const localBindingConfig: Record<string, unknown> = {
    main: "./worker/index.ts",
    compatibility_flags: ["nodejs_compat"],
  };

  if (d1DatabaseId) {
    localBindingConfig.d1_databases = [
      {
        binding: "DB",
        database_name: "nagarai-d1",
        database_id: d1DatabaseId,
      },
    ];
  }

  return {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
    },
    plugins: [
      vinext(),
      nagaraiPlugin(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: localBindingConfig,
      }),
    ],
  };
});
