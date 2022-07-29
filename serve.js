import esbuild from "esbuild";
import { pnpPlugin } from "@yarnpkg/esbuild-plugin-pnp";

esbuild
  .serve(
    {
      servedir: "dist",
      host: "127.0.0.1",
      port: 3000,
      onRequest: (...args) =>
        args.forEach(({ method, status, path }) =>
          console.log(`[${method} - ${status} - ${path}]`)
        ),
    },
    {
      entryPoints: ["src/index.js"],
      loader: {
        ".jpeg": "dataurl",
      },
      sourcemap: true,
      minify: true,
      bundle: true,
      outdir: "dist",
      plugins: [pnpPlugin()],
    }
  )
  .then(
    ({ port, host }) => console.log(`serving ${host}:${port}`)
    // Call "stop" on the web server to stop serving
    // server.stop()
  )
  .catch(() => process.exit(1));
