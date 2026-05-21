const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");

const APP_NAME = "Appe";
const APP_VERSION = "0.1.0";
const PUBLIC_DIR = path.join(__dirname, "public");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function sendJson(response, statusCode, payload) {
  const body = `${JSON.stringify(payload, null, 2)}\n`;
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

function resolvePublicPath(urlPath) {
  const requestedPath = urlPath === "/" ? "/index.html" : decodeURIComponent(urlPath);
  const candidatePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));
  const relativePath = path.relative(PUBLIC_DIR, candidatePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return candidatePath;
}

function serveStaticFile(response, urlPath) {
  let filePath;

  try {
    filePath = resolvePublicPath(urlPath);
  } catch (error) {
    sendText(response, 400, "Bad request");
    return;
  }

  if (!filePath) {
    sendText(response, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendText(response, 404, "Not found");
      return;
    }

    const extension = path.extname(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Content-Length": stats.size,
    });

    fs.createReadStream(filePath).pipe(response);
  });
}

function createServer() {
  return http.createServer((request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);

    if (request.method !== "GET") {
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

// #     if (requestUrl.pathname === "/health") {
// #       sendJson(response, 200, { status: "ok", service: APP_NAME, version: APP_VERSION });
// #       return;
// #     }
// # 
// #     if (requestUrl.pathname === "/api/info") {
// #       sendJson(response, 200, {
// #         name: APP_NAME,
// #         version: APP_VERSION,
// #         message: "Container-ready starter app is running.",
// #         endpoints: ["/", "/health", "/api/info"],
// #       });
// #       return;
// #     }

    serveStaticFile(response, requestUrl.pathname);
  });
}

function startServer() {
  const port = Number.parseInt(process.env.PORT || "8000", 10);
  const host = process.env.HOST || "0.0.0.0";
  const server = createServer();

  server.listen(port, host, () => {
    console.log(`${APP_NAME} ${APP_VERSION} listening on http://${host}:${port}`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = {
  APP_NAME,
  APP_VERSION,
  createServer,
};
