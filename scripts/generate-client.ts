import { execFile } from "node:child_process";
import path from "node:path";

async function generate(): Promise<void> {
  const bin = path.resolve(__dirname, "../web/client/node_modules/.bin/openapi-typescript");
  const outPath = path.resolve(__dirname, "../web/client/src/generated/client.ts");
  const url =
    process.env.OPENAPI_URL ??
    path.resolve(__dirname, "../web/client/openapi.json");
  const args = url.startsWith("http")
    ? [url, "--output", outPath]
    : [url, "--output", outPath];
  await new Promise<void>((resolve, reject) => {
    execFile(bin, args, (error) => {
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
