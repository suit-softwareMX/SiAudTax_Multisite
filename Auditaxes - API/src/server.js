import { createApp } from "./app.js";
import { config } from "./config.js";

const server = createApp().listen(config.port, () => {
  console.log(`AUDITAXES API disponible en http://localhost:${config.port}`);
  console.log(`Contenido: ${config.contentRoot}`);
});

function stop() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
