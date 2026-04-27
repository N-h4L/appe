# Appe

Appe is a small dependency-free Node.js web app that is ready to run locally or inside a container.

## Run Locally

```powershell
node server.js
```

Open <http://127.0.0.1:8000>.

## Test

```powershell
node test/server.test.js
```

The same commands are also available as npm scripts:

```powershell
npm.cmd start
npm.cmd test
```

## Build And Run With Docker

```powershell
docker build -t appe-simple .
docker run --rm -p 8000:8000 appe-simple
```

Open <http://127.0.0.1:8000>.

## Endpoints

- `/` - web page
- `/health` - health check JSON
- `/api/info` - app metadata JSON

## Deploy

Deploy this project to any container host that accepts a Dockerfile. The app listens on the `PORT` environment variable and defaults to `8000`.
