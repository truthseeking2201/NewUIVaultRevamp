import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import {
  SuiPythClient,
  SuiPriceServiceConnection,
} from "@pythnetwork/pyth-sui-js";

export const getPriceOracle = async (priceIDs: string[], suiClient: any) => {
  /// Get the off-chain data.
  const connection = new SuiPriceServiceConnection(
    "https://hermes.pyth.network/", // Use this for Mainnet
    {
      // Provide this option to retrieve signed price updates for on-chain contracts!
      priceFeedRequestConfig: {
        binary: true,
      },
    }
  );

  const priceUpdateData = await connection.getPriceFeedsUpdateData(priceIDs);

  // Fixed the StateIds using the CLI example extracting them from
  // here: https://docs.pyth.network/price-feeds/contract-addresses/sui
  const pythStateId =
    "0x1f9310238ee9298fb703c3419030b35b22bb1cc37113e3bb5007c99aec79e5b8";
  const wormholeStateId =
    "0xaeab97f96cf9877fee2883315d459552b2b921edc16d7ceac6eab944dd88919c";
  const transaction: any = new Transaction();

  const pythClient = new SuiPythClient(suiClient, pythStateId, wormholeStateId);
  /// By calling the updatePriceFeeds function, the SuiPythClient adds the necessary
  /// transactions to the transaction block to update the price feeds.
  const priceInfoObjectIds = await pythClient.updatePriceFeeds(
    transaction,
    priceUpdateData,
    priceIDs
  );
  return priceInfoObjectIds;
};
