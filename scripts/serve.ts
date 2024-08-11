import { join, basename } from "node:path";
import { readdir } from "node:fs/promises";
import lightningcss from "bun-lightningcss";

const publicFiles: string[] = [];

readdir("public")
  .then((files) => {
    publicFiles.push(...files);
  })
  .catch(console.error);

// Function to handle requests
async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/script.js") {
    console.log("Building script.js");
    try {
      const results = await Bun.build({
        entrypoints: ["src/index.tsx"],
        plugins: [lightningcss()],
        target: "browser",
        minify: true,
        sourcemap: "inline",
      });
      const code = await results.outputs[0].text();

      return new Response(code, {
        headers: { "Content-Type": "application/javascript" },
      });
    } catch (err) {
      console.log(err);
      return new Response("Failed to compile script.js", { status: 500 });
    }
  }

  const path = basename(url.pathname === "/" ? "/index.html" : url.pathname);
  if (publicFiles.includes(path)) {
    return new Response(Bun.file(join("public", path)));
  }
  return new Response("File not found", { status: 404 });
}

// Start the server
Bun.serve({
  port: 3000,
  fetch: handleRequest,
});

console.log("Server running on http://localhost:3000");
