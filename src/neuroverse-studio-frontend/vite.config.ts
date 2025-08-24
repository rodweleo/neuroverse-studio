import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dfxJson from "../../dfx.json";
import fs from "fs";
import environment from "vite-plugin-environment";
import { fileURLToPath, URL } from "url";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

let localCanisters: any, prodCanisters: any, canisters;

function readJson(filePath: string) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return undefined;
  }
}

function initCanisterIds() {
  try {
    localCanisters = readJson(
      path.resolve("..", "..", ".dfx", "local", "canister_ids.json")
    );
  } catch (error) {
    console.log(error);
    console.log("No local canister_ids.json found. Continuing production");
  }
  try {
    prodCanisters = readJson(
      path.resolve("..", "..", ".dfx", "ic", "canister_ids.json")
    );
  } catch (error) {
    console.log("No production canister_ids.json found. Continuing with local");
  }

  const network = process.env.DFX_NETWORK || "local";

  canisters = network === "local" ? localCanisters : prodCanisters;

  for (const canister in canisters) {
    process.env[canister.toUpperCase()] = canisters[canister][network];
  }
}
initCanisterIds();

// List of all aliases for canisters
const aliases = Object.entries(dfxJson.canisters).reduce(
  (acc, [name, _value]) => {
    // Get the network name, or `local` by default.
    const networkName = process.env["DFX_NETWORK"] || "local";
    const outputRoot = path.join(
      "..",
      "..",
      ".dfx",
      networkName,
      "canisters",
      name
    );

    return {
      ...acc,
      ["dfx-generated/" + name]: path.join(outputRoot, name + ".did.js"),
    };
  },
  {}
);

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
      host: "127.0.0.1",
    },
  },
  plugins: [
    react(),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  resolve: {
    alias: {
      ...aliases,
      "@": path.resolve(__dirname, "./src"),
      declarations: fileURLToPath(
        new URL("../src/declarations", import.meta.url)
      ),
    },
  },
  define: {
    "process.env": process.env,
  },
}));
