import { registerHooks } from "node:module";
import { extname } from "node:path";

// Node 24 synchronous resolve API:
// https://nodejs.org/download/release/v24.14.0/docs/api/module.html#synchronous-resolvespecifier-context-nextresolve
// Test-only resolution; Node's built-in loader still strips TypeScript.
const sourceRoot = new URL("../../src/", import.meta.url).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!context.parentURL?.startsWith(sourceRoot)) {
      return nextResolve(specifier, context);
    }

    const alias = specifier.startsWith("@/");
    const relative = specifier.startsWith("./") || specifier.startsWith("../");
    if (!alias && !relative) return nextResolve(specifier, context);

    const target = new URL(
      alias ? specifier.slice(2) : specifier,
      alias ? sourceRoot : context.parentURL
    );
    if (!target.href.startsWith(sourceRoot)) {
      return nextResolve(specifier, context);
    }

    try {
      return nextResolve(alias ? target.href : specifier, context);
    } catch (error) {
      if (
        error.code !== "ERR_MODULE_NOT_FOUND" ||
        extname(target.pathname) || target.search || target.hash
      ) {
        throw error;
      }
      return nextResolve(`${target.href}.ts`, context);
    }
  },
});
