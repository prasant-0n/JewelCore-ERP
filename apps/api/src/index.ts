import { createApp } from "./app.js";
import { setupWebSocketServer } from "./modules/telemetry/telemetryService.js";

const app = createApp();
const port = Number(process.env.PORT ?? 4000);

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[JewelCore API] Express 5 server listening on port ${port}`);
});

// Attach bidirectional WebSocket server to HTTP instance
setupWebSocketServer(server);

process.on("SIGTERM", () => {
  // eslint-disable-next-line no-console
  console.log(
    "[JewelCore API] SIGTERM received. Gracefully closing HTTP server...",
  );
  server.close(() => {
    process.exit(0);
  });
});
