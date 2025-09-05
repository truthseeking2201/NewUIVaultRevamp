/**
 * Version checker utility for auto-refreshing the app when a new deployment is detected
 */

// This will be set during build time
const VERSION_FILE_PATH = "/version.json";
const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds

type VersionData = {
  version: string;
  semanticVersion: string;
  forceUpdate: boolean;
};

let currentVersion: string | null = null;

/**
 * Fetches the current version from the version file
 */
const fetchVersion = async (): Promise<VersionData | null> => {
  try {
    // Add cache-busting parameter to avoid CloudFront/browser caching
    const response = await fetch(`${VERSION_FILE_PATH}?t=${Date.now()}`);
    if (!response.ok) {
      console.warn("Failed to fetch version file:", response.status);
      return null;
    }

    const data = await response.json();
    return data as VersionData;
  } catch (error) {
    console.warn("Error fetching version:", error);
    return null;
  }
};

/**
 * Initializes the version checker
 */
export const initVersionChecker = async (
  showToast: () => void,
  setAppVersion
): Promise<void> => {
  // Skip for development environment
  if (import.meta.env.DEV) {
    console.log("Version checker disabled in development mode");
    return;
  }

  try {
    // Get initial version
    const versionData = await fetchVersion();
    currentVersion = versionData?.version || null;
    setAppVersion(versionData?.semanticVersion);
    if (!currentVersion) {
      console.warn(
        "Could not determine initial version, disabling version checker"
      );
      return;
    }

    console.log(
      "Version checker initialized with version:",
      new Date(currentVersion)
    );

    // Start periodic checking
    setInterval(async () => {
      const newVersionData = await fetchVersion();
      const newVersion = newVersionData?.version || null;
      const isNewVersion = newVersion && newVersion !== currentVersion;
      if (isNewVersion) {
        console.log(
          `New version detected: ${currentVersion} → ${newVersion}. Refreshing...`
        );

        if (newVersionData?.forceUpdate) {
          location.reload();
          return;
        }
      }
    }, CHECK_INTERVAL);
  } catch (error) {
    console.error("Error initializing version checker:", error);
  }
};
