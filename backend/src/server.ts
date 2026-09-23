import { app } from "./app.js";
import { env } from "./config/env.js";
import { initializeDatabase } from "./database/db.js";

const port = env.port;

await initializeDatabase();

app.listen(port, () => {
  console.log(`Nexus Store backend listening on port ${port}`);
});
