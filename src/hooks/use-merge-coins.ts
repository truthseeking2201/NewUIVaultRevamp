import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useWallet } from "./use-wallet";
import { Transaction } from "@mysten/sui/transactions";

interface UseMergeCoinsResult {
  mergeCoins: (coinType: string) => Promise<string | undefined>;
  isLoading: boolean;
  error: Error | null;
}

export const useMergeCoins = (): UseMergeCoinsResult => {
  const { mutateAsync: signAndExecuteTransaction, isPending } =
    useSignAndExecuteTransaction();
  const { address } = useWallet();
  const suiClient = useSuiClient();

  const mergeCoins = async (coinType: string): Promise<string | undefined> => {
    if (!address) {
      throw new Error("No account connected");
    }

    try {
      const coins = await suiClient.getCoins({
        owner: address,
        coinType,
      });

      // If there's only one coin or no coins, return the coin object ID
      if (coins.data.length <= 1) {
        return coins.data[0]?.coinObjectId;
      }

      const tx = new Transaction();
      const primaryCoin = tx.object(coins.data[0].coinObjectId);
      const coinsToMerge = coins.data
        .slice(1)
        .map((coin) => tx.object(coin.coinObjectId));

      if (coinsToMerge.length > 0) {
        tx.mergeCoins(primaryCoin, coinsToMerge);
      }

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      // Wait for transaction to be confirmed
      await suiClient.waitForTransaction({
        digest: result.digest,
      });

      // Return the merged coin object ID
      return coins.data[0].coinObjectId;
    } catch (error) {
      console.error("Error merging coins:", error);
      throw error;
    }
  };

  return {
    mergeCoins,
    isLoading: isPending,
    error: null, // You can enhance this by tracking errors if needed
  };
};
