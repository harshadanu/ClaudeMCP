import { z } from "zod";
import { logger } from "../utils/logger.js";
import { isChatGPT } from "../utils/client-detector.js";

// Moro Hub news, announcements, and press releases
const MORO_HUB_NEWS = [
  {
    id: "news-001",
    title: "Moro Hub Certified as World's Largest Solar-Powered Data Centre by Guinness World Records",
    category: "Award",
    date: "2025-03-15",
    summary:
      "Moro Hub's Green Data Centre at the Mohammed bin Rashid Al Maktoum Solar Park has been officially certified by Guinness World Records as the world's largest solar-powered data centre, with over 100 MW of dedicated solar capacity powering more than 1,000 racks.",
    highlights: [
      "100+ MW dedicated solar capacity",
      "First data centre in the region to achieve this milestone",
      "LEED Platinum and Tier 3 Uptime certified",
      "Zero carbon operations",
    ],
    url: "https://www.morohub.com/en/about-us/news/guinness-world-record",
    tags: ["Award", "Sustainability", "Data Centre"],
  },
  {
    id: "news-002",
    title: "Emirates Group Partners with Moro Hub for Green Data Centre Migration",
    category: "Partnership",
    date: "2026-02-10",
    summary:
      "The Emirates Group has signed a landmark agreement with Moro Hub to migrate its critical IT infrastructure to the world's largest solar-powered data centre. The migration is expected to complete mid-2026 and will significantly reduce the Emirates Group's carbon footprint.",
    highlights: [
      "Major enterprise colocation agreement",
      "Migration expected mid-2026",
      "Supports Emirates Group sustainability goals",
      "Includes managed services and 24/7 SOC coverage",
    ],
    url: "https://www.morohub.com/en/about-us/news/emirates-group-partnership",
    tags: ["Partnership", "Colocation", "Enterprise"],
  },
  {
    id: "news-003",
    title: "Moro Hub and Dubai Islamic Bank Sign Cybersecurity and Colocation Agreement",
    category: "Partnership",
    date: "2024-10-22",
    summary:
      "Dubai Islamic Bank (DIB) has selected Moro Hub as its strategic partner for colocation services and managed cybersecurity. The partnership includes 24/7 SOC monitoring and incident response for DIB's critical banking infrastructure.",
    highlights: [
      "Financial sector cybersecurity partnership",
      "24/7 SOC monitoring for banking infrastructure",
      "Colocation at green data centre",
      "Compliance with UAE Central Bank regulations",
    ],
    url: "https://www.morohub.com/en/about-us/news/dib-partnership",
    tags: ["Partnership", "Cybersecurity", "Finance"],
  },
  {
    id: "news-004",
    title: "Moro Hub Launches AI & Data Analytics Services in Partnership with SAS",
    category: "Product Launch",
    date: "2025-09-05",
    summary:
      "Moro Hub has expanded its Professional Services portfolio with the launch of AI and Data Analytics services, developed in collaboration with SAS. The new offering enables organisations to harness AI-driven insights hosted on Moro Hub's secure, green cloud infrastructure.",
    highlights: [
      "AI-powered analytics on green cloud",
      "Strategic partnership with SAS",
      "Available for government and enterprise sectors",
      "Hosted entirely within UAE data sovereignty boundaries",
    ],
    url: "https://www.morohub.com/en/about-us/news/sas-ai-analytics",
    tags: ["Product Launch", "AI", "Cloud"],
  },
  {
    id: "news-005",
    title: "Moro Hub Achieves ISO 27001 and SOC 2 Type II Certifications for Cyber Defence Centre",
    category: "Certification",
    date: "2025-06-18",
    summary:
      "Moro Hub's Cyber Defence Centre has achieved ISO 27001 and SOC 2 Type II certifications, reinforcing its position as a trusted cybersecurity partner for enterprise and government organisations across the UAE.",
    highlights: [
      "ISO 27001 information security certification",
      "SOC 2 Type II audit passed",
      "Covers threat monitoring, incident response, and forensics",
      "Applicable to Managed SOC customers",
    ],
    url: "https://www.morohub.com/en/about-us/news/iso27001-soc2-certification",
    tags: ["Certification", "Cybersecurity"],
  },
  {
    id: "news-006",
    title: "Moro Hub Opens Smart City Innovation Lab at Dubai Future District",
    category: "Expansion",
    date: "2026-01-20",
    summary:
      "Moro Hub has inaugurated its Smart City Innovation Lab at the Dubai Future District, providing a dedicated environment for developing and testing IoT, smart city, and AI solutions in collaboration with government and private sector partners.",
    highlights: [
      "Located at Dubai Future District, Za'abeel",
      "Dedicated IoT and smart city R&D environment",
      "Open to government and enterprise partners",
      "Live proof-of-concept demos available",
    ],
    url: "https://www.morohub.com/en/about-us/news/smart-city-lab",
    tags: ["Expansion", "Smart City", "IoT"],
  },
];

const inputSchema = z
  .object({
    category: z.string().optional(),
    limit: z.number().optional(),
  })
  .strict();

const replyWithState = (message, news) => ({
  content: message ? [{ type: "text", text: message }] : [],
  structuredContent: { news: { articles: news, total: news.length } },
});

export const registerNewsTools = (server) => {
  server.registerTool(
    "get_news",
    {
      title: "Get Moro Hub news",
      description:
        "Returns the latest Moro Hub news, announcements, partnerships, and press releases. Optionally filter by category (Award, Partnership, Product Launch, Certification, Expansion) or limit the number of results.",
      inputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async (args) => {
      logger.info("get_news tool invoked", args ?? {});

      let news = [...MORO_HUB_NEWS].sort((a, b) => new Date(b.date) - new Date(a.date));

      if (args?.category) {
        const filter = args.category.toLowerCase();
        news = news.filter(
          (n) =>
            n.category.toLowerCase().includes(filter) ||
            n.tags.some((t) => t.toLowerCase().includes(filter))
        );
      }

      if (args?.limit && args.limit > 0) {
        news = news.slice(0, args.limit);
      }

      const message =
        news.length > 0
          ? `Found ${news.length} Moro Hub news article(s).`
          : "No news found for that category.";

      let detailedMessage = message;
      if (!isChatGPT() && news.length > 0) {
        detailedMessage += "\n\nLatest Moro Hub News:\n";
        news.forEach((n, i) => {
          detailedMessage += `\n${i + 1}. [${n.date}] ${n.title}`;
          detailedMessage += `\n   Category: ${n.category}  |  Tags: ${n.tags.join(", ")}`;
          detailedMessage += `\n   ${n.summary}`;
          if (n.highlights?.length) {
            detailedMessage += `\n   Key highlights:`;
            n.highlights.forEach((h) => (detailedMessage += `\n   • ${h}`));
          }
          detailedMessage += `\n   Read more: ${n.url}`;
        });
      }

      return replyWithState(detailedMessage, news);
    }
  );
};
