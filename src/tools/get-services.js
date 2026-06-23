import { z } from "zod";
import { logger } from "../utils/logger.js";
import { isChatGPT } from "../utils/client-detector.js";

// TechHub services catalog
const TECHHUB_SERVICES = [
  // ── Cloud Services ──────────────────────────────────────────────────
  {
    id: "svc-001",
    name: "Cloud Hosting",
    category: "Cloud Services",
    description:
      "Resilient, highly available multi-tenant cloud infrastructure. Includes compute, network, storage, and security on a single platform hosted in the world's largest solar-powered data centre.",
    url: "https://www.techhub.com/en/solutions-services/services/cloud-hosting-services/",
    icon: "cloud",
    available: true,
  },
  {
    id: "svc-002",
    name: "Multi-Cloud Management",
    category: "Cloud Services",
    description:
      "Unified management across public, private, and hybrid cloud environments. Optimise costs, governance, and performance from a single control plane.",
    url: "https://www.techhub.com/en/solutions-services/services/cloud-hosting-services/",
    icon: "layers",
    available: true,
  },
  {
    id: "svc-003",
    name: "Cloud Migration",
    category: "Cloud Services",
    description:
      "End-to-end migration of workloads to TechHub's green cloud. Assessment, planning, execution, and post-migration support included.",
    url: "https://www.techhub.com/en/solutions-services/services/cloud-hosting-services/",
    icon: "upload-cloud",
    available: true,
  },

  // ── Data Centre & Colocation ────────────────────────────────────────
  {
    id: "svc-004",
    name: "Data Centre Colocation",
    category: "Data Centre",
    description:
      "Flexible rack and cage space in TechHub's Tier 3 Uptime-certified, LEED Platinum green data centre at the Mohammed bin Rashid Al Maktoum Solar Park. 100% renewable energy powered.",
    url: "https://www.techhub.com/en/solutions-services/services/data-center-services/",
    icon: "server",
    available: true,
  },
  {
    id: "svc-005",
    name: "Disaster Recovery as a Service (DRaaS)",
    category: "Data Centre",
    description:
      "Automated failover and business continuity solutions ensuring rapid recovery of critical systems with near-zero downtime.",
    url: "https://www.techhub.com/en/solutions-services/services/data-center-services/",
    icon: "refresh-cw",
    available: true,
  },

  // ── Cybersecurity ───────────────────────────────────────────────────
  {
    id: "svc-006",
    name: "Managed SOC (Security Operations Centre)",
    category: "Cybersecurity",
    description:
      "24/7 threat monitoring, detection, and response from TechHub's Cyber Defence Centre. Covers threat hunting, incident response, and forensic analysis.",
    url: "https://www.techhub.com/en/solutions-services/services/cyber-security/",
    icon: "shield",
    available: true,
  },
  {
    id: "svc-007",
    name: "Vulnerability Assessment & Penetration Testing",
    category: "Cybersecurity",
    description:
      "Comprehensive security assessments identifying and remediating vulnerabilities across networks, applications, and infrastructure.",
    url: "https://www.techhub.com/en/solutions-services/services/cyber-security/",
    icon: "alert-triangle",
    available: true,
  },
  {
    id: "svc-008",
    name: "Identity & Access Management (IAM)",
    category: "Cybersecurity",
    description:
      "Zero-trust identity frameworks, multi-factor authentication, and privileged access management for enterprise environments.",
    url: "https://www.techhub.com/en/solutions-services/services/cyber-security/",
    icon: "lock",
    available: true,
  },

  // ── Managed Services ────────────────────────────────────────────────
  {
    id: "svc-009",
    name: "Managed IT Services",
    category: "Managed Services",
    description:
      "Fully outsourced IT operations covering infrastructure monitoring, patch management, helpdesk, and service desk — freeing internal teams to focus on business priorities.",
    url: "https://www.techhub.com/en/solutions-services/services/managed-services/",
    icon: "settings",
    available: true,
  },
  {
    id: "svc-010",
    name: "Managed Security Services",
    category: "Managed Services",
    description:
      "Ongoing security management including firewall administration, endpoint protection, log management, and compliance reporting.",
    url: "https://www.techhub.com/en/solutions-services/services/managed-services/",
    icon: "shield-check",
    available: true,
  },

  // ── Smart City & IoT ────────────────────────────────────────────────
  {
    id: "svc-011",
    name: "Smart City Solutions",
    category: "Smart City & IoT",
    description:
      "Industry-specific digital platforms for government, utilities, and transport sectors. Integrates IoT sensors, data analytics, and AI to power smarter urban operations.",
    url: "https://www.techhub.com/en/solutions-services/industries/",
    icon: "cpu",
    available: true,
  },
  {
    id: "svc-012",
    name: "IoT Platform & Device Management",
    category: "Smart City & IoT",
    description:
      "Scalable platform for connecting, managing, and analysing data from thousands of IoT devices across city infrastructure.",
    url: "https://www.techhub.com/en/solutions-services/industries/",
    icon: "wifi",
    available: true,
  },

  // ── Professional Services ────────────────────────────────────────────
  {
    id: "svc-013",
    name: "Digital Transformation Consulting",
    category: "Professional Services",
    description:
      "Strategic advisory and implementation support for organisations embarking on digital transformation journeys — from cloud readiness assessments to full-scale programme delivery.",
    url: "https://www.techhub.com/en/solutions-services/services/",
    icon: "trending-up",
    available: true,
  },
  {
    id: "svc-014",
    name: "AI & Data Analytics Services",
    category: "Professional Services",
    description:
      "AI-driven insights and analytics solutions built in partnership with SAS. Enables data-driven decision-making across industries.",
    url: "https://www.techhub.com/en/solutions-services/services/",
    icon: "bar-chart-2",
    available: true,
  },
  {
    id: "svc-015",
    name: "Green IT Sustainability Assessment",
    category: "Professional Services",
    description:
      "Evaluate and reduce your organisation's IT carbon footprint with a migration pathway to TechHub's zero-carbon infrastructure.",
    url: "https://www.techhub.com/en/solutions-services/services/",
    icon: "leaf",
    available: false,
  },
];

const inputSchema = z
  .object({
    category: z.string().optional(),
  })
  .strict();

let servicesState = {
  status: "idle",
  message: "",
  services: [],
};

const replyWithState = (message, nextState = servicesState) => ({
  content: message ? [{ type: "text", text: message }] : [],
  structuredContent: { services: nextState },
});

export const registerServicesTools = (server) => {
  server.registerTool(
    "get_services",
    {
      title: "Get TechHub services",
      description:
        "Returns TechHub's full services catalog — Cloud Services, Data Centre, Cybersecurity, Managed Services, Smart City & IoT, and Professional Services. Optionally filter by category name.",
      inputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async (args) => {
      logger.info("get_services tool invoked", args ?? {});

      let services = [...TECHHUB_SERVICES];

      // Filter by category if provided
      if (args?.category) {
        const filter = args.category.toLowerCase();
        services = services.filter((svc) =>
          svc.category.toLowerCase().includes(filter)
        );
      }

      const available = services.filter((s) => s.available);
      const message =
        services.length > 0
          ? `Found ${services.length} TechHub service(s) — ${available.length} currently available.`
          : "No services found for that category.";

      servicesState = { status: "success", message, services };

      let detailedMessage = message;
      if (!isChatGPT() && services.length > 0) {
        detailedMessage += "\n\nTechHub Services:\n";
        services.forEach((svc, i) => {
          detailedMessage += `\n${i + 1}. ${svc.name} [${svc.category}]${svc.available ? "" : " — Coming Soon"}`;
          detailedMessage += `\n   ${svc.description}`;
          detailedMessage += `\n   Learn more: ${svc.url}`;
        });
      }

      return replyWithState(detailedMessage, servicesState);
    }
  );
};
