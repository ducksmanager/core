import { readFileSync, writeFileSync } from "fs";

const polyfill =
  `if (!("toHex" in Uint8Array.prototype)) {` +
  `Object.defineProperty(Uint8Array.prototype, "toHex", {` +
  `value() { return Array.from(this, b => b.toString(16).padStart(2, "0")).join(""); },` +
  `writable: true, configurable: true });}\n`;

const path = "dist/pdf.worker.mjs";
writeFileSync(path, polyfill + readFileSync(path, "utf8"));
