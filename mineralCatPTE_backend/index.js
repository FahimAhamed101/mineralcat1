const cluster = require("node:cluster");
const os = require("node:os");
const { connectDatabase, registerScheduledJobs } = require("./serverRuntime");

const PORT = Number(process.env.PORT) || 3750;
const HOST = process.env.HOST || "0.0.0.0";
const availableCpuCount =
  typeof os.availableParallelism === "function"
    ? os.availableParallelism()
    : os.cpus().length;
const configuredWorkerCount = Number(process.env.WEB_CONCURRENCY);
const workerCount =
  Number.isFinite(configuredWorkerCount) && configuredWorkerCount > 0
    ? Math.min(Math.floor(configuredWorkerCount), availableCpuCount)
    : 1;
const scheduledJobsEnabled = process.env.ENABLE_SCHEDULED_JOBS !== "false";

async function startServer() {
  await connectDatabase();
  const app = require("./app");

  app.listen(PORT, HOST, () => {
    console.log(`App listening on ${HOST}:${PORT} (pid ${process.pid})`);
  });
}

async function startPrimary() {
  console.log(
    `Primary ${process.pid} starting ${workerCount} worker(s) on ${HOST}:${PORT}`
  );

  if (scheduledJobsEnabled) {
    await connectDatabase();
    registerScheduledJobs();
  }

  for (let index = 0; index < workerCount; index += 1) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Worker ${worker.process.pid} died (code: ${code ?? "n/a"}, signal: ${signal ?? "n/a"}). Restarting...`
    );
    cluster.fork();
  });
}

function handleStartupError(error, scope) {
  console.error(`${scope} startup failed:`, error);
  process.exit(1);
}

if (workerCount === 1) {
  startServer().catch((error) => handleStartupError(error, "Single-process"));
} else if (cluster.isPrimary) {
  startPrimary().catch((error) => handleStartupError(error, "Primary"));
} else {
  startServer().catch((error) => handleStartupError(error, "Worker"));
}
