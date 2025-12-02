import { build as viteBuild } from "vite";
import { rm } from "fs/promises";

async function buildClient() {
  // Do NOT delete VITE_API_URL, we need it for the client build to know where the API is
  // if we are baking it in. However, usually VITE_API_URL is used at runtime via import.meta.env
  // which is replaced at build time. So we need it present in the environment when running this script.

  console.log("building client...");
  await viteBuild();
}

buildClient().catch((err) => {
  console.error(err);
  process.exit(1);
});
