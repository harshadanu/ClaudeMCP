import { z } from "zod";
import { logger } from "../utils/logger.js";
import { isChatGPT } from "../utils/client-detector.js";

// Haversine formula — distance in km between two lat/lon points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// TechHub facility and office locations across Dubai
const TECHHUB_LOCATIONS = [
  {
    id: "loc-001",
    name: "TechHub Headquarters",
    category: "Head Office",
    address: "Al Shifa Tower, Dubai Internet City, Dubai, UAE",
    latitude: "25.0953",
    longitude: "55.1529",
    phone: "+971 4 601 9000",
    hours: "Sun–Thu 08:00–17:00",
    status: "Open",
    description: "Main corporate headquarters housing leadership, sales, and customer success teams.",
  },
  {
    id: "loc-002",
    name: "Green Data Centre — Solar Park",
    category: "Data Centre",
    address: "Mohammed bin Rashid Al Maktoum Solar Park, Seih Al Dahal, Dubai, UAE",
    latitude: "24.7453",
    longitude: "55.3730",
    phone: "+971 4 601 9001",
    hours: "24/7 Operations",
    status: "Open",
    description: "World's largest solar-powered data centre. Guinness World Record certified. LEED Platinum & Tier 3 Uptime certified. 100+ MW capacity, 1,000+ racks.",
  },
  {
    id: "loc-003",
    name: "Cyber Defence Centre",
    category: "Security Operations",
    address: "Dubai Silicon Oasis, Building A5, Dubai, UAE",
    latitude: "25.1173",
    longitude: "55.3773",
    phone: "+971 4 601 9002",
    hours: "24/7 Operations",
    status: "Open",
    description: "Dedicated 24/7 Security Operations Centre (SOC) for threat monitoring, incident response, forensic analysis, and threat hunting.",
  },
  {
    id: "loc-004",
    name: "Cloud Services Hub — Jebel Ali",
    category: "Data Centre",
    address: "Jebel Ali Free Zone (JAFZA), Dubai, UAE",
    latitude: "25.0117",
    longitude: "55.1307",
    phone: "+971 4 601 9003",
    hours: "24/7 Operations",
    status: "Open",
    description: "Secondary data centre facility offering colocation, cloud hosting, and managed services with high-bandwidth connectivity.",
  },
  {
    id: "loc-005",
    name: "Customer Experience Centre — DIFC",
    category: "Customer Centre",
    address: "Gate Village, Dubai International Financial Centre, Dubai, UAE",
    latitude: "25.2122",
    longitude: "55.2796",
    phone: "+971 4 601 9004",
    hours: "Sun–Thu 08:00–18:00",
    status: "Open",
    description: "Client-facing centre for enterprise consultations, solution demos, and onboarding for financial sector customers.",
  },
  {
    id: "loc-006",
    name: "Smart City Innovation Lab",
    category: "Innovation Centre",
    address: "Dubai Future District, Za'abeel, Dubai, UAE",
    latitude: "25.2285",
    longitude: "55.3000",
    phone: "+971 4 601 9005",
    hours: "Sun–Thu 09:00–17:00",
    status: "Open",
    description: "R&D and innovation hub for smart city, IoT, and AI solutions. Hosts partner demos and proof-of-concept environments.",
  },
  {
    id: "loc-007",
    name: "Abu Dhabi Government Services Office",
    category: "Regional Office",
    address: "Hub71, Al Khatem Tower, ADGM Square, Al Maryah Island, Abu Dhabi, UAE",
    latitude: "24.4979",
    longitude: "54.3863",
    phone: "+971 2 601 9006",
    hours: "Sun–Thu 08:00–17:00",
    status: "Open",
    description: "Regional office serving Abu Dhabi government and enterprise clients with cloud, cybersecurity, and managed services.",
  },
];

const inputSchema = z
  .object({
    userLatitude: z.number().optional(),
    userLongitude: z.number().optional(),
    category: z.string().optional(),
  })
  .strict();

let locationsState = {
  status: "idle",
  message: "",
  locations: [],
  selectedId: "",
};

const replyWithState = (message, nextState = locationsState) => ({
  content: message ? [{ type: "text", text: message }] : [],
  structuredContent: { locations: nextState },
});

export const registerLocationsTools = (server) => {
  server.registerTool(
    "get_locations",
    {
      title: "Get TechHub locations",
      description:
        "Returns TechHub facility and office locations across the UAE — data centres, the Cyber Defence Centre, customer experience centres, and regional offices. Optionally filter by category (e.g. 'Data Centre', 'Security Operations', 'Customer Centre'). If userLatitude and userLongitude are provided, locations are sorted by distance nearest first.",
      inputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async (args) => {
      logger.info("get_locations tool invoked", args ?? {});

      let locations = [...TECHHUB_LOCATIONS];

      // Filter by category if provided
      if (args?.category) {
        const filter = args.category.toLowerCase();
        locations = locations.filter((loc) =>
          loc.category.toLowerCase().includes(filter)
        );
      }

      // Sort by distance if user coordinates provided
      if (args?.userLatitude !== undefined && args?.userLongitude !== undefined) {
        logger.debug("Sorting TechHub locations by distance");
        locations = locations.map((loc) => {
          const lat = parseFloat(loc.latitude);
          const lon = parseFloat(loc.longitude);
          if (isNaN(lat) || isNaN(lon)) return { ...loc, distance: null };
          return {
            ...loc,
            distance: calculateDistance(args.userLatitude, args.userLongitude, lat, lon),
          };
        });
        locations.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
      }

      const message =
        locations.length > 0
          ? `Found ${locations.length} TechHub location(s).${
              args?.userLatitude !== undefined && locations[0]?.distance != null
                ? ` Nearest is ${locations[0].distance.toFixed(1)} km away.`
                : ""
            }`
          : "No TechHub locations found for that category.";

      locationsState = { status: "success", message, locations, selectedId: "" };

      let detailedMessage = message;
      if (!isChatGPT() && locations.length > 0) {
        detailedMessage += "\n\nTechHub Locations:\n";
        locations.forEach((loc, i) => {
          detailedMessage += `\n${i + 1}. ${loc.name} [${loc.category}]`;
          if (loc.distance != null) {
            detailedMessage += ` — ${loc.distance.toFixed(1)} km away`;
          }
          detailedMessage += `\n   ${loc.description}`;
          detailedMessage += `\n   Address: ${loc.address}`;
          detailedMessage += `\n   Hours: ${loc.hours}  |  Status: ${loc.status}`;
          if (loc.phone) detailedMessage += `\n   Phone: ${loc.phone}`;
        });
      }

      return replyWithState(detailedMessage, locationsState);
    }
  );
};
