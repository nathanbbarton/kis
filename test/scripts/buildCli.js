import esbuild from "esbuild"
import path from "path"

const cliOptions = {
    entryPoints: ["./src/cli/cli.ts"],
    bundle: true,
    platform: "node",
    external: ["fs", "path"],
    tsconfig: path.resolve("./configs/tsconfig.build.json"),
    outfile: "./dist/bin/cli.js",
    format: "esm",
    banner: {
        js: "#!/usr/bin/env node"
    }
}

// Build CLI
esbuild.build(cliOptions).catch(() => process.exit(1))
