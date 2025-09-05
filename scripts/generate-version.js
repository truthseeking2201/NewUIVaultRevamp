#!/usr/bin/env node

/**
 * Script to generate a version.json file with a timestamp
 * This will be used by the app to check for new deployments
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// Get the directory name using ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Output directory
const outputDir = path.resolve(__dirname, "../dist");
const versionFile = path.join(outputDir, "version.json");

// Generate a version identifier
// Using a timestamp ensures uniqueness across deployments
const version = new Date().toISOString();

// Get the latest commit message and check for force-update
function shouldForceUpdate() {
  try {
    // Get the latest commit message
    const commitMessage = execSync("git log -1 --pretty=%B", {
      encoding: "utf8",
      cwd: path.resolve(__dirname, ".."),
    }).trim();

    // Check if commit message contains "force-update" (case insensitive)
    return commitMessage.toLowerCase().includes("force-update");
  } catch (error) {
    console.warn(`⚠️  Could not get commit message: ${error.message}`);
    return false;
  }
}

// Create version data
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf8")
);

const forceUpdate = shouldForceUpdate();

const versionData = {
  version,
  timestamp: Date.now(),
  generated: new Date().toISOString(),
  semanticVersion: packageJson.version,
  forceUpdate,
};

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the version file
fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));

console.log(`✅ Generated version.json with version: ${version}`);
console.log(`🔄 Force update: ${forceUpdate}`);
