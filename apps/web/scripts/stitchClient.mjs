import https from "node:https";

const STITCH_ENDPOINT = "https://stitch.googleapis.com/mcp";
const API_KEY = process.env.STITCH_API_KEY || "";
export const ACTIVE_PROJECT_ID = process.env.STITCH_PROJECT_ID || "11962210453565494044";

/**
 * Execute a JSON-RPC call against Google Stitch MCP server.
 */
export async function callStitchMcp(method, params = {}) {
  const payload = JSON.stringify({
    jsonrpc: "2.0",
    id: Date.now(),
    method,
    params,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      STITCH_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            const data = JSON.parse(raw);
            if (data.error) {
              reject(new Error(data.error.message || JSON.stringify(data.error)));
            } else {
              resolve(data.result);
            }
          } catch (err) {
            reject(new Error(`Failed to parse response: ${raw}`));
          }
        });
      },
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Call a specific Stitch tool.
 */
export async function callStitchTool(toolName, args = {}) {
  const result = await callStitchMcp("tools/call", {
    name: toolName,
    arguments: args,
  });
  return result;
}

export async function listProjects() {
  return callStitchTool("list_projects", {});
}

export async function listScreens(projectId = ACTIVE_PROJECT_ID) {
  return callStitchTool("list_screens", { projectId });
}

export async function generateScreen(prompt, { projectId = ACTIVE_PROJECT_ID, deviceType = "DESKTOP" } = {}) {
  return callStitchTool("generate_screen_from_text", {
    projectId,
    prompt,
    deviceType,
  });
}

export async function downloadFile(name) {
  return callStitchTool("download_file", { name });
}

// CLI test runner if executed directly
if (process.argv[1]?.endsWith("stitchClient.mjs")) {
  const action = process.argv[2] || "list-screens";
  if (action === "list-projects") {
    console.log("Listing projects...");
    listProjects().then((res) => console.log(JSON.stringify(res, null, 2))).catch(console.error);
  } else if (action === "list-screens") {
    console.log(`Listing screens for project ${ACTIVE_PROJECT_ID}...`);
    listScreens().then((res) => console.log(JSON.stringify(res, null, 2))).catch(console.error);
  } else {
    console.log(`Unknown action: ${action}`);
  }
}
