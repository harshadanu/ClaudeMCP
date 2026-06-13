import { z } from "zod";
import { logger } from "../utils/logger.js";
import { isChatGPT } from "../utils/client-detector.js";

// Hardcoded demo status for Moro Hub data centre facilities
const DATA_CENTRE_STATUS = {
  lastUpdated: "2026-06-13T18:00:00Z",
  overallStatus: "Operational",
  facilities: [
    {
      id: "dc-001",
      name: "Green Data Centre — Solar Park",
      location: "Mohammed bin Rashid Al Maktoum Solar Park, Dubai",
      status: "Operational",
      uptime: "99.999%",
      uptimeDays: 847,
      tier: "Tier 3 Uptime Certified",
      powerSource: "100% Solar Renewable",
      solarCapacityMW: 104,
      pue: 1.35,
      temperature: "21°C",
      humidity: "45%",
      totalRacks: 1000,
      availableRacks: 143,
      occupancyPercent: 85.7,
      activeIncidents: 0,
      certifications: ["Tier 3 Uptime", "LEED Platinum", "ISO 27001", "PCI-DSS"],
    },
    {
      id: "dc-002",
      name: "Cloud Services Hub — Jebel Ali",
      location: "Jebel Ali Free Zone (JAFZA), Dubai",
      status: "Operational",
      uptime: "99.98%",
      uptimeDays: 612,
      tier: "Tier 3",
      powerSource: "Grid + Renewable Offset",
      solarCapacityMW: 0,
      pue: 1.52,
      temperature: "22°C",
      humidity: "47%",
      totalRacks: 400,
      availableRacks: 68,
      occupancyPercent: 83.0,
      activeIncidents: 0,
      certifications: ["Tier 3", "ISO 27001"],
    },
    {
      id: "dc-003",
      name: "Cyber Defence Centre",
      location: "Dubai Silicon Oasis, Dubai",
      status: "Operational",
      uptime: "100%",
      uptimeDays: 365,
      tier: "SOC Tier 1",
      powerSource: "Dual Feed + UPS",
      solarCapacityMW: 0,
      pue: 1.45,
      temperature: "20°C",
      humidity: "43%",
      totalRacks: 80,
      availableRacks: 12,
      occupancyPercent: 85.0,
      activeIncidents: 0,
      certifications: ["ISO 27001", "SOC 2 Type II"],
    },
  ],
  networkStatus: {
    status: "All Systems Normal",
    latencyMs: 2,
    bandwidthUtilizationPercent: 34,
    activeConnections: 1247,
    redundantPaths: true,
  },
  sustainabilityToday: {
    solarEnergyGeneratedKWh: 248000,
    co2SavedKg: 124000,
    renewablePercent: 100,
  },
};

const inputSchema = z
  .object({
    facility: z.string().optional(),
  })
  .strict();

const replyWithState = (message, data) => ({
  content: message ? [{ type: "text", text: message }] : [],
  structuredContent: { dataCentreStatus: data },
});

export const registerDataCentreStatusTools = (server) => {
  server.registerTool(
    "get_data_centre_status",
    {
      title: "Get data centre status",
      description:
        "Returns live operational status of Moro Hub's data centre facilities — uptime, PUE, rack availability, active incidents, power source, and sustainability metrics. Optionally filter by facility name.",
      inputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async (args) => {
      logger.info("get_data_centre_status tool invoked", args ?? {});

      let facilities = [...DATA_CENTRE_STATUS.facilities];

      if (args?.facility) {
        const filter = args.facility.toLowerCase();
        facilities = facilities.filter((f) =>
          f.name.toLowerCase().includes(filter) ||
          f.location.toLowerCase().includes(filter)
        );
      }

      const hasIncidents = facilities.some((f) => f.activeIncidents > 0);
      const message = hasIncidents
        ? `⚠️ ${facilities.filter((f) => f.activeIncidents > 0).length} facility has active incidents.`
        : `All ${facilities.length} Moro Hub data centre facilities are fully operational.`;

      const data = { ...DATA_CENTRE_STATUS, facilities };

      let detailedMessage = message;
      if (!isChatGPT()) {
        detailedMessage += `\nLast updated: ${DATA_CENTRE_STATUS.lastUpdated}\n`;

        facilities.forEach((f) => {
          detailedMessage += `\n━━━ ${f.name} ━━━`;
          detailedMessage += `\n  Status: ${f.status}  |  Uptime: ${f.uptime} (${f.uptimeDays} days)`;
          detailedMessage += `\n  Tier: ${f.tier}  |  Power: ${f.powerSource}`;
          detailedMessage += `\n  PUE: ${f.pue}  |  Temp: ${f.temperature}  |  Humidity: ${f.humidity}`;
          detailedMessage += `\n  Racks: ${f.totalRacks - f.availableRacks}/${f.totalRacks} occupied (${f.occupancyPercent}%)`;
          detailedMessage += `\n  Active Incidents: ${f.activeIncidents === 0 ? "None ✓" : f.activeIncidents}`;
          detailedMessage += `\n  Certifications: ${f.certifications.join(", ")}`;
        });

        detailedMessage += `\n\n━━━ Network ━━━`;
        detailedMessage += `\n  ${DATA_CENTRE_STATUS.networkStatus.status}`;
        detailedMessage += `\n  Latency: ${DATA_CENTRE_STATUS.networkStatus.latencyMs}ms  |  Bandwidth: ${DATA_CENTRE_STATUS.networkStatus.bandwidthUtilizationPercent}% utilised`;

        detailedMessage += `\n\n━━━ Sustainability Today ━━━`;
        detailedMessage += `\n  Solar Generated: ${(DATA_CENTRE_STATUS.sustainabilityToday.solarEnergyGeneratedKWh / 1000).toFixed(0)} MWh`;
        detailedMessage += `\n  CO₂ Saved: ${(DATA_CENTRE_STATUS.sustainabilityToday.co2SavedKg / 1000).toFixed(1)} tonnes`;
        detailedMessage += `\n  Renewable: ${DATA_CENTRE_STATUS.sustainabilityToday.renewablePercent}%`;
      }

      return replyWithState(detailedMessage, data);
    }
  );
};
