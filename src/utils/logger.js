import fs from "node:fs";
import path from "node:path";

const LEVELS = {
  DEBUG: 10,
  INFO: 20,
  WARNING: 30,
  ERROR: 40,
  CRITICAL: 50,
};

const activeLevelName =
  (process.env.NODE_ENV || "").toLowerCase() === "production" ? "INFO" : "DEBUG";
const activeLevelValue = LEVELS[activeLevelName] ?? LEVELS.INFO;

const LOG_DIR = path.resolve("logs");
const MAX_LOG_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

try {
  fs.mkdirSync(LOG_DIR, { recursive: true });
} catch {
  // Fall back to console-only logging if directory cannot be created.
}

const formatArg = (value) => {
  if (value instanceof Error) return value.stack || value.message;
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return String(value);
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "[unserializable object]";
    }
  }
  return String(value);
};

const resolveLogFilePath = (date) => {
  for (let i = 0; i < 10000; i++) {
    const suffix = i === 0 ? "" : `_${i}`;
    const filePath = path.join(LOG_DIR, `${date}${suffix}.log`);
    try {
      if (!fs.existsSync(filePath)) return filePath;
      const { size } = fs.statSync(filePath);
      if (size < MAX_LOG_FILE_SIZE_BYTES) return filePath;
    } catch {
      return filePath;
    }
  }
  return path.join(LOG_DIR, `${date}_overflow.log`);
};

const appendToFile = (line) => {
  const date = new Date().toISOString().slice(0, 10);
  const filePath = resolveLogFilePath(date);
  try {
    fs.appendFileSync(filePath, `${line}\n`, { encoding: "utf8" });
  } catch {
    // Swallow file write errors.
  }
};

const writeLog = (levelName, args) => {
  if (LEVELS[levelName] < activeLevelValue) return;

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${levelName}]`;
  const message = args.map(formatArg).join(" ");
  const line = `${prefix} ${message}`;

  appendToFile(line);

  if (levelName === "WARNING") { console.warn(prefix, ...args); return; }
  if (levelName === "ERROR" || levelName === "CRITICAL") { console.error(prefix, ...args); return; }
  if (levelName === "DEBUG" && console.debug) { console.debug(prefix, ...args); return; }
  console.log(prefix, ...args);
};

export const logger = {
  debug: (...args) => writeLog("DEBUG", args),
  info: (...args) => writeLog("INFO", args),
  warning: (...args) => writeLog("WARNING", args),
  error: (...args) => writeLog("ERROR", args),
  critical: (...args) => writeLog("CRITICAL", args),
  level: activeLevelName,
};
