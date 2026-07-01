import * as express from "express";
import * as http from "http";

export function listen(app: express.Express): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

export function close(server: http.Server | undefined): Promise<void> {
  if (!server) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    server.close((error?: Error) => error ? reject(error) : resolve());
  });
}
