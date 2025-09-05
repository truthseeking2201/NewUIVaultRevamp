#!/usr/bin/env node

/**
 * Script to bump semantic version in package.json
 * Usage: node scripts/bump-version.js [major|minor|patch]
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// Get the directory name using ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Package.json path
const packageJsonPath = path.resolve(__dirname, "../package.json");

// Get bump type from command line arguments
const bumpType = process.argv[2];

if (!bumpType || !["major", "minor", "patch"].includes(bumpType)) {
  console.error("❌ Usage: node scripts/bump-version.js [major|minor|patch]");
  console.error("   major: 1.0.0 -> 2.0.0");
  console.error("   minor: 1.0.0 -> 1.1.0");
  console.error("   patch: 1.0.0 -> 1.0.1");
  process.exit(1);
}

/**
 * Parse semantic version string
 * @param {string} version - Version string like "1.2.3"
 * @returns {object} - Parsed version object
 */
function parseVersion(version) {
  const parts = version.split(".").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid version format: ${version}`);
  }
  return {
    major: parts[0],
    minor: parts[1],
    patch: parts[2],
  };
}

/**
 * Bump version based on type
 * @param {object} version - Parsed version object
 * @param {string} type - Bump type (major, minor, patch)
 * @returns {string} - New version string
 */
function bumpVersion(version, type) {
  switch (type) {
    case "major":
      return `${version.major + 1}.0.0`;
    case "minor":
      return `${version.major}.${version.minor + 1}.0`;
    case "patch":
      return `${version.major}.${version.minor}.${version.patch + 1}`;
    default:
      throw new Error(`Invalid bump type: ${type}`);
  }
}

try {
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const currentVersion = packageJson.version;

  console.log(`📦 Current version: ${currentVersion}`);

  // Parse and bump version
  const parsedVersion = parseVersion(currentVersion);
  const newVersion = bumpVersion(parsedVersion, bumpType);

  // Update package.json
  packageJson.version = newVersion;
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + "\n"
  );

  console.log(
    `🚀 Bumped ${bumpType} version: ${currentVersion} -> ${newVersion}`
  );

  // Check if git is available and create a tag
  try {
    execSync("git --version", { stdio: "pipe" });

    // Check if there are any changes to commit
    try {
      const status = execSync("git status --porcelain", { encoding: "utf8" });
      if (status.trim()) {
        console.log("📝 Committing version bump...");
        execSync(`git add package.json`);
        execSync(`git commit -m "chore: bump version to ${newVersion}"`);
      }

      console.log("🏷️  Creating git tag...");
      execSync(`git tag v${newVersion}`);
      console.log(`✅ Created git tag: v${newVersion}`);
      console.log("💡 Don't forget to push with: git push && git push --tags");
    } catch (gitError) {
      console.log(
        "⚠️  Git operations failed (this is okay if not in a git repo)"
      );
    }
  } catch (error) {
    console.log("⚠️  Git not available, skipping tag creation");
  }

  console.log(`\n✨ Version successfully bumped to ${newVersion}`);
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}
