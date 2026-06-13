import { registerLocationsTools } from "./get-locations.js";
import { registerServicesTools } from "./get-services.js";
import { registerDataCentreStatusTools } from "./get-data-centre-status.js";
import { registerSupportOptionsTools } from "./get-support-options.js";
import { registerNewsTools } from "./get-news.js";
import { logger } from "../utils/logger.js";

export const registerTools = (server) => {
  logger.info("Registering MCP tools");
  registerLocationsTools(server);
  registerServicesTools(server);
  registerDataCentreStatusTools(server);
  registerSupportOptionsTools(server);
  registerNewsTools(server);
  logger.info("All tools registered");
};
