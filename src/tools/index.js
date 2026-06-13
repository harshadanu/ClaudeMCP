import { registerLocationsTools } from "./get-locations.js";
import { registerServicesTools } from "./get-services.js";
import { logger } from "../utils/logger.js";

export const registerTools = (server) => {
  logger.info("Registering MCP tools");
  registerLocationsTools(server);
  registerServicesTools(server);
  logger.info("All tools registered");
};
