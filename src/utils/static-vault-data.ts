import { getDepositVaults } from "@/apis/vault";
import { DepositVaultConfig } from "@/types/vault-config.types";
import { QueryClient } from "@tanstack/react-query";

// Cache for the loaded static data
let staticVaultData: DepositVaultConfig[];
const hasLoadStaticData = {};
/**
 * Load vault data from static JSON file (generated at build time)
 * Falls back to API call if static data is not available
 */

async function loadRealTimeData(accountAddress?: string) {
  return getDepositVaults(accountAddress).then((res: any) => {
    const latestVaults = res.map((item) => {
      return { ...item, ready: true };
    });
    return latestVaults;
  });
}

export async function loadVaultData(
  queryClient: QueryClient,
  accountAddress?: string
): Promise<DepositVaultConfig[]> {
  try {
    if (!hasLoadStaticData[accountAddress]) {
      // Try to load static data first
      const response = await fetch("/vault-data.json");
      if (response.ok) {
        const responseData = (await response.json()) as {
          data: DepositVaultConfig[];
        };
        if (!responseData?.data) {
          return await loadRealTimeData(accountAddress);
        }
        staticVaultData = responseData.data.map((item) => {
          return { ...item, apr: 0 };
        });
      }

      loadRealTimeData(accountAddress).then((latestVaults) => {
        queryClient.setQueryData(
          ["deposit-vaults-data", accountAddress],
          latestVaults
        );
      });
    }
  } catch (error) {
    console.warn("⚠️ Static vault data not found, using real time data");
  }

  if (hasLoadStaticData[accountAddress]) {
    staticVaultData = await loadRealTimeData(accountAddress);
  }

  hasLoadStaticData[accountAddress] = true;

  return staticVaultData;
}
