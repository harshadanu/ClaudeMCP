import { z } from "zod";
import { logger } from "../utils/logger.js";
import { isChatGPT } from "../utils/client-detector.js";

// TechHub support channels and contact options
const SUPPORT_OPTIONS = [
  {
    id: "sup-001",
    type: "Emergency Hotline",
    title: "24/7 Data Centre Emergency",
    description: "For critical infrastructure incidents, power outages, or physical security issues at any TechHub facility.",
    contact: "+971 4 601 9911",
    availability: "24/7 — Always On",
    responseTarget: "Immediate",
    icon: "phone-call",
  },
  {
    id: "sup-002",
    type: "SOC Emergency",
    title: "Cyber Defence Hotline",
    description: "Report active cyber incidents, breaches, ransomware, or critical security alerts to the TechHub Security Operations Centre.",
    contact: "+971 4 601 9999",
    availability: "24/7 — Always On",
    responseTarget: "Under 15 minutes",
    icon: "shield-alert",
  },
  {
    id: "sup-003",
    type: "General Support",
    title: "Customer Support Centre",
    description: "General enquiries, service requests, billing, account management, and non-critical technical support.",
    contact: "+971 4 601 9000",
    availability: "Sun–Thu 08:00–18:00 GST",
    responseTarget: "Under 4 hours",
    icon: "headphones",
  },
  {
    id: "sup-004",
    type: "Email",
    title: "Support Email",
    description: "Submit support requests, attach logs or screenshots, and track your case via email.",
    contact: "support@techhub.com",
    availability: "Monitored 24/7",
    responseTarget: "Under 8 hours",
    icon: "mail",
  },
  {
    id: "sup-005",
    type: "Support Portal",
    title: "Online Support Portal",
    description: "Create and track tickets, access the knowledge base, download SLA reports, and manage your support cases online.",
    contact: "https://support.techhub.com",
    availability: "24/7 self-service",
    responseTarget: "Instant ticket creation",
    icon: "monitor",
  },
  {
    id: "sup-006",
    type: "Sales & Partnerships",
    title: "Sales Enquiries",
    description: "New service enquiries, partnership proposals, procurement, and commercial discussions.",
    contact: "sales@techhub.com",
    availability: "Sun–Thu 08:00–18:00 GST",
    responseTarget: "Under 24 hours",
    icon: "briefcase",
  },
  {
    id: "sup-007",
    type: "Visit Us",
    title: "Customer Experience Centre — DIFC",
    description: "Book an in-person consultation, solution demo, or facility tour at our DIFC Customer Experience Centre.",
    contact: "https://www.techhub.com/en/visit-the-hub/",
    availability: "Sun–Thu 08:00–18:00 GST",
    responseTarget: "By appointment",
    icon: "map-pin",
  },
];

const SLA_TIERS = [
  {
    tier: "Platinum",
    description: "Mission-critical enterprise workloads",
    availability: "99.999% uptime SLA",
    responseTime: "15-minute incident response",
    supportHours: "24/7 dedicated team",
  },
  {
    tier: "Gold",
    description: "Business-critical applications",
    availability: "99.99% uptime SLA",
    responseTime: "1-hour incident response",
    supportHours: "24/7 shared team",
  },
  {
    tier: "Silver",
    description: "Standard business workloads",
    availability: "99.9% uptime SLA",
    responseTime: "4-hour incident response",
    supportHours: "Business hours",
  },
];

const inputSchema = z
  .object({
    type: z.string().optional(),
  })
  .strict();

const replyWithState = (message, data) => ({
  content: message ? [{ type: "text", text: message }] : [],
  structuredContent: { supportOptions: { options: data, slaTiers: SLA_TIERS } },
});

export const registerSupportOptionsTools = (server) => {
  server.registerTool(
    "get_support_options",
    {
      title: "Get TechHub support options",
      description:
        "Returns all TechHub support channels — emergency hotlines, SOC contact, customer support, email, online portal, and sales. Also includes SLA tier information. Optionally filter by type (e.g. 'Emergency', 'Email', 'Portal').",
      inputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async (args) => {
      logger.info("get_support_options tool invoked", args ?? {});

      let options = [...SUPPORT_OPTIONS];

      if (args?.type) {
        const filter = args.type.toLowerCase();
        options = options.filter((o) =>
          o.type.toLowerCase().includes(filter) ||
          o.title.toLowerCase().includes(filter)
        );
      }

      const message =
        options.length > 0
          ? `Found ${options.length} TechHub support channel(s).`
          : "No support options found for that type.";

      let detailedMessage = message;
      if (!isChatGPT() && options.length > 0) {
        detailedMessage += "\n\nTechHub Support Channels:\n";
        options.forEach((o, i) => {
          detailedMessage += `\n${i + 1}. ${o.title} [${o.type}]`;
          detailedMessage += `\n   ${o.description}`;
          detailedMessage += `\n   Contact: ${o.contact}`;
          detailedMessage += `\n   Available: ${o.availability}`;
          detailedMessage += `\n   Response Target: ${o.responseTarget}`;
        });

        if (!args?.type) {
          detailedMessage += "\n\nSLA Tiers:\n";
          SLA_TIERS.forEach((s) => {
            detailedMessage += `\n• ${s.tier}: ${s.availability} — ${s.responseTime} — ${s.supportHours}`;
          });
        }
      }

      return replyWithState(detailedMessage, options);
    }
  );
};
