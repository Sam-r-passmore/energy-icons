/**
 * Remote MCP endpoint: https://energyicons.com/mcp
 *
 * Add this URL as a custom connector in Claude (Settings → Connectors) or as an
 * app in ChatGPT (Settings → Apps → Developer mode). Stateless Streamable HTTP,
 * no auth. The tools live in src/lib/mcp/server.ts.
 */
import { createMcpHandler } from "mcp-handler";

import { siteConfig } from "@/config/site";
import { MCP_INSTRUCTIONS, registerEnergyIconTools } from "@/lib/mcp/server";

const handler = createMcpHandler(registerEnergyIconTools, {
  serverInfo: { name: "energy-icons", version: siteConfig.version },
  instructions: MCP_INSTRUCTIONS,
});

export { handler as GET, handler as POST, handler as DELETE };
