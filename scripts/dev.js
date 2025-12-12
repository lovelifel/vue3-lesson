// 这个文件打包 packages下的文件
import minimist from "minimist";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { createRequire } from "module";
import esbuild from "esbuild";
const args = minimist(process.argv.slice(2));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const target = args._[0] || "reactivity";
const format = args.f || "iife";
const pkg = require(`../packages/${target}/package.json`);

const entry = resolve(__dirname, `../packages/${target}/src/index.ts`);
const {
  buildOptions: { name = "" },
} = pkg;

esbuild.build({
  entryPoints: [entry],
  outfile: `packages/${target}/dist/${target}.${format}.js`,
  bundle: true,
  sourcemap: true,
  format,
  platform: "browser",
  globalName: name,
});
