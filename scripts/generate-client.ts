import { execFile } from "node:child_process";
import path from "node:path";

async function generate(): Promise<void> {
  const bin = path.resolve(__dirname, "../web/client/node_modules/.bin/openapi-typescript");
  const outPath = path.resolve(__dirname, "../web/client/src/generated/client.ts");
  await new Promise<void>((resolve, reject) => {
    execFile(bin, ["http://localhost:8000/openapi.json", "--output", outPath], (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
