import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const result = spawnSync(process.execPath, [nextBin, "build"], {
  env: {
    ...process.env,
    BUILD_TARGET: "pages",
    NEXT_TELEMETRY_DISABLED: "1",
  },
  stdio: "inherit",
});

process.exit(result.status ?? 1);
