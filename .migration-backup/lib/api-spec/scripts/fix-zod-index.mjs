import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = resolve(__dirname, "..", "..", "api-zod", "src", "index.ts");

const contents = `export * from "./generated/api";
`;

writeFileSync(target, contents, "utf8");
