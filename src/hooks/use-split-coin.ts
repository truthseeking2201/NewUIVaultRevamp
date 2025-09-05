import { SUI_CONFIG } from "@/config/coin-config";
import { useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import BigNumber from "bignumber.js";
import { useMergeCoins } from "./use-merge-coins";

export const useSplitCoin = () => {
  const suiClient = useSuiClient();
  const { mergeCoins } = useMergeCoins();

  const smartSplitCoin = async (
    tx: Transaction,
    coinType: string,
    decimals: number,
    amount: string | number,
    address: string
  ) => {
    const coins = await suiClient.getCoins({
      owner: address,
      coinType,
    });
    const splitAmount = new BigNumber(amount)
      .multipliedBy(new BigNumber(10).pow(decimals))
      .toFixed(0);

    const sufficientCoin = coins.data.find((coin) =>
      new BigNumber(coin.balance).gte(new BigNumber(splitAmount))
    );

    if (coinType === SUI_CONFIG.coinType) {
      const [splitCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(splitAmount)]);
      return splitCoin;
    }

    if (sufficientCoin) {
      const [splitCoin] = tx.splitCoins(
        tx.object(sufficientCoin.coinObjectId),
        [tx.pure.u64(splitAmount)]
      );
      return splitCoin;
    } else {
      const mergedCoinId = await mergeCoins(coinType);
      if (!mergedCoinId) {
        throw new Error("No coins available to deposit");
      }
      const [splitCoin] = tx.splitCoins(tx.object(mergedCoinId), [
        tx.pure.u64(splitAmount),
      ]);
      return splitCoin;
    }
  };

  // for testing
  async function splitMultipleUSDCAmounts(
    senderAddress: string,
    amount: number, // Array of USDC amounts to split
    coinType: string
  ) {
    const tx = new Transaction();

    const { data: usdcCoins } = await suiClient.getCoins({
      owner: senderAddress,
      coinType,
    });

    const amountMicro = amount * 1_000_000;

    // Split the coin
    const [splitCoin] = tx.splitCoins(tx.object(usdcCoins[0].coinObjectId), [
      tx.pure.u64(amountMicro),
    ]);

    // ✅ Transfer back to sender to avoid unused value error
    tx.transferObjects([splitCoin], tx.pure.address(senderAddress));

    return tx;
  }

  return { smartSplitCoin, splitMultipleUSDCAmounts };
};
