/**
 * Zodスキーマ(src/lib/schemas, src/lib/openapi/document.ts)からOpenAPI定義を生成し、
 * openapi/openapi.yaml / openapi/openapi.json に書き出す。
 *
 * 実行: npm run openapi:generate
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { stringify } from "yaml";

import { buildOpenApiDocument } from "../src/lib/openapi/document";

async function main() {
  const document = buildOpenApiDocument();
  const outDir = path.resolve(import.meta.dirname, "..", "openapi");
  await mkdir(outDir, { recursive: true });

  const yamlPath = path.join(outDir, "openapi.yaml");
  const jsonPath = path.join(outDir, "openapi.json");

  await writeFile(
    yamlPath,
    `# このファイルは scripts/generate-openapi.ts により自動生成される。\n# 直接編集せず、src/lib/schemas または src/lib/openapi/document.ts を変更してから\n# \`npm run openapi:generate\` を再実行すること。\n${stringify(document)}`,
    "utf-8",
  );
  await writeFile(jsonPath, `${JSON.stringify(document, null, 2)}\n`, "utf-8");

  console.log(`Generated: ${path.relative(process.cwd(), yamlPath)}`);
  console.log(`Generated: ${path.relative(process.cwd(), jsonPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
