import { executionProfitData, getEstimateDualDeposit } from "@/apis/vault";
import { SUI_CONFIG } from "@/config/coin-config";
import {
  CLOCK,
  DUAL_TOKEN_DEPOSIT_CONFIG,
  EXCHANGE_CODES_MAP,
  RATE_DENOMINATOR,
} from "@/config/vault-config";
import { getBalanceAmountForInput } from "@/lib/number";
import {
  SCVaultConfig,
  VaultSwapDepositInfo,
} from "@/types/vault-config.types";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import BigNumber from "bignumber.js";
import { Buffer } from "buffer";
import { useGetVaultConfig, useVaultBasicDetails } from "./use-vault";
import { useWallet } from "./use-wallet";
import { logger } from "@/utils/logger";
import { useQuery } from "@tanstack/react-query";
import { EstimateDualDepositToken } from "@/types/deposit-token.types";
import { useSplitCoin } from "./use-split-coin";
import { bcs } from "@mysten/sui/bcs";
import { getPriceOracle } from "@/services/pyth-services";

type DepositCoin = {
  coin_type: string;
  decimals: number;
};

type DepositArgs = {
  coin: DepositCoin;
  amount: number;
  swapDepositInfo: VaultSwapDepositInfo;
  collateralToken: string;
  slippage?: number;
  onDepositSuccessCallback?: (data: any) => void;
};

type DualDepositCoin = {
  coin_type: string;
  decimals: number;
  amount: string;
  price_feed_id: string;
};

type DualDepositArgs = {
  coinA: DualDepositCoin;
  coinB: DualDepositCoin;
  exchange_id: number;
  tick_upper: number;
  tick_lower: number;
  onDepositSuccessCallback?: (data: any) => void;
};

const MODULE_ADAPTERS = {
  mmt: "mmt_adapter",
  bluefin: "bluefin_adapter",
  cetus: "cetus_adapter",
};

const buildTarget = (
  coin: DepositCoin,
  vaultPackageId: string,
  swapDepositInfo: VaultSwapDepositInfo,
  collateralToken: string
) => {
  if (coin.coin_type === collateralToken) {
    return `${vaultPackageId}::vault::deposit_with_sigs_credit_time`;
  }
  if (!swapDepositInfo) {
    throw new Error("No swap deposit info");
  }
  const { vault_package_id, vault_package_module, vault_package_function } =
    swapDepositInfo;

  return `${vault_package_id}::${vault_package_module}::${vault_package_function}`;
};

const validateDepositGasFee = async (suiClient: SuiClient, address: string) => {
  const suiCoins = await suiClient.getCoins({
    owner: address,
    coinType: SUI_CONFIG.coinType,
  });

  const totalSuiBalance = getBalanceAmountForInput(
    suiCoins.data.reduce((sum, coin) => {
      return sum.plus(new BigNumber(coin.balance || "0"));
    }, new BigNumber(0)),
    SUI_CONFIG.decimals,
    SUI_CONFIG.decimals
  );

  // Check if user is trying to deposit coin with insufficient SUI balance
  if (totalSuiBalance < SUI_CONFIG.gas_fee) {
    throw new Error(
      `Insufficient SUI balance. You need at least ${SUI_CONFIG.gas_fee} SUI ` +
        `(${
          SUI_CONFIG.gas_fee
        } for gas fees). Current balance: ${totalSuiBalance.toFixed(6)} SUI`
    );
  }

  return totalSuiBalance;
};

const validateDepositSui = async (totalSuiBalance: number, amount: number) => {
  const amountWithGasFee = amount + SUI_CONFIG.gas_fee;

  if (totalSuiBalance - amountWithGasFee < 0) {
    throw new Error(
      `Insufficient SUI balance. You need at least ${amountWithGasFee} SUI ` +
        `(${
          SUI_CONFIG.gas_fee
        } for gas fees). Current balance: ${totalSuiBalance.toFixed(6)} SUI`
    );
  }
};

export const useDepositVault = (vaultId: string) => {
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const { address } = useWallet();
  const suiClient = useSuiClient();
  const { data: vaultConfig } = useVaultBasicDetails(vaultId);

  const { smartSplitCoin } = useSplitCoin();

  const deposit = async ({
    coin,
    amount,
    swapDepositInfo,
    collateralToken,
    slippage,
    onDepositSuccessCallback,
  }: DepositArgs) => {
    try {
      const packageId = vaultConfig.metadata.package_id;
      if (!address) {
        throw new Error("No account connected");
      }

      if (!packageId) {
        throw new Error("No package id");
      }

      await validateDepositGasFee(suiClient, address);

      const profitData: any = await executionProfitData(vaultConfig.vault_id);
      if (!profitData || !profitData?.signature) {
        throw new Error("Failed to get signature");
      }

      const tx = new Transaction();
      const splitCoin = await smartSplitCoin(
        tx,
        coin.coin_type,
        coin.decimals,
        amount,
        address
      );

      const baseParams = [
        tx.pure.u64(profitData.vault_value_usd),
        tx.pure.u64(new BigNumber(profitData.profit_amount).abs().toString()),
        tx.pure.bool(profitData.negative),
        tx.pure.u64(profitData.expire_time),
        tx.pure.u64(profitData.last_credit_time),
        tx.pure(
          "vector<vector<u8>>",
          [profitData.signer_publickey].map((key) =>
            Array.from(Buffer.from(key, "hex"))
          )
        ),
        tx.pure(
          "vector<vector<u8>>",
          [profitData.signature].map((key) =>
            Array.from(Buffer.from(key, "hex"))
          )
        ),
        tx.object(CLOCK),
      ];

      let slippageBps = 300; // 3%
      if (slippage) {
        slippageBps = slippage * 100;
      }
      let _arguments: any = [];
      let _typeArguments: any = [];
      if (coin.coin_type === collateralToken) {
        _arguments = [
          tx.object(vaultConfig.metadata.vault_config_id),
          tx.object(vaultConfig.vault_id),
          splitCoin,
          ...baseParams,
        ];
        _typeArguments = [
          vaultConfig.collateral_token,
          vaultConfig.vault_lp_token,
        ];
      } else {
        _typeArguments = [
          coin.coin_type,
          swapDepositInfo.vault_collateral_token,
          swapDepositInfo.vault_lp_token,
        ];
        switch (swapDepositInfo.vault_package_module) {
          case MODULE_ADAPTERS.mmt:
            _arguments = [
              tx.object(swapDepositInfo.vault_config),
              tx.object(swapDepositInfo.vault_id),
              tx.object(swapDepositInfo.pool_address),
              tx.object(swapDepositInfo.version),
              splitCoin,
              tx.pure.u128(slippageBps),
              ...baseParams,
            ];
            break;
          case MODULE_ADAPTERS.bluefin:
          case MODULE_ADAPTERS.cetus:
            _arguments = [
              tx.object(swapDepositInfo.vault_config),
              tx.object(swapDepositInfo.vault_id),
              tx.object(swapDepositInfo.global_config),
              tx.object(swapDepositInfo.pool_address),
              splitCoin,
              tx.pure.u128(slippageBps),
              ...baseParams,
            ];
            break;
          default:
            throw new Error("Invalid vault package module");
        }
      }

      const target = buildTarget(
        coin,
        packageId,
        swapDepositInfo,
        collateralToken
      );
      tx.moveCall({
        target,
        arguments: _arguments,
        typeArguments: _typeArguments,
      });
      // console.log("🧱 Inputs:", tx.blockData.inputs);
      // console.log("📄 Raw tx:", JSON.stringify(tx.serialize(), null, 2));
      const result = await signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: async (data) => {
            const { digest } = data;

            const txResponse = await suiClient.waitForTransaction({
              digest,
              options: {
                showEvents: true,
              },
            });

            const events = txResponse?.events;

            const depositEvent = events.find((event) =>
              event.type.includes("vault::DepositWithSigTimeEvent")
            );
            logger.debug("🚀 ~ depositEvent:", depositEvent);
            // Pass the event data to your callback
            onDepositSuccessCallback?.({
              ...data,
              depositAmount: (depositEvent?.parsedJson as { amount?: number })
                ?.amount,
              depositLpAmount: (depositEvent?.parsedJson as { lp?: number })
                ?.lp,
            });
          },
          onError: (error) => {
            console.error("Deposit failed:", error);
            throw error;
          },
        }
      );

      return result;
    } catch (error) {
      console.error("Error in deposit:", error);
      throw error;
    }
  };

  return {
    deposit,
  };
};

export const useCalculateNDLPReturn = (
  amount: number,
  collateralTokenDecimals: number,
  ndlpDecimals: number,
  vaultId: string
) => {
  const { vaultConfig } = useGetVaultConfig(vaultId);
  const vaultRate = +vaultConfig?.rate || 1000000;

  if (!amount || !vaultConfig || !collateralTokenDecimals || !ndlpDecimals) {
    return 0;
  }

  const rawAmount = amount * 10 ** collateralTokenDecimals;
  const fee = (rawAmount * +vaultConfig.deposit.fields.fee_bps) / 10000;
  const net_amount = rawAmount - fee;

  const lp = (net_amount * RATE_DENOMINATOR) / vaultRate;

  const ndlpAmountWillGet = lp / Math.pow(10, ndlpDecimals);

  return Number(ndlpAmountWillGet);
};

// calculate the rate of 1 collateral = ? NDLP
export const useCollateralLPRate = (
  isReverse = false,
  vaultConfig: SCVaultConfig
) => {
  if (!vaultConfig) {
    return 1;
  }

  const vaultRate = +vaultConfig?.rate;

  const rate = vaultRate / RATE_DENOMINATOR;

  const collateralTokenRate = isReverse ? rate : 1 / rate;

  return collateralTokenRate;
};

export const useDepositDualVault = (vaultId: string) => {
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const { address } = useWallet();
  const suiClient = useSuiClient();
  const { data: vaultConfig } = useVaultBasicDetails(vaultId);
  const { smartSplitCoin } = useSplitCoin();

  const deposit = async ({
    coinA,
    coinB,
    tick_upper,
    tick_lower,
    onDepositSuccessCallback,
  }: DualDepositArgs) => {
    try {
      const packageId = vaultConfig.metadata.package_id;
      if (!address) {
        throw new Error("No account connected");
      }

      if (!packageId) {
        throw new Error("No package id");
      }

      await validateDepositGasFee(suiClient, address);

      const profitData: any = await executionProfitData(vaultConfig.vault_id);
      if (!profitData || !profitData?.signature) {
        throw new Error("Failed to get signature");
      }

      const priceFeedsObjectIds = await getPriceOracle(
        [
          vaultConfig.collateral_price_feed_id,
          coinA.price_feed_id,
          coinB.price_feed_id,
        ],
        suiClient
      );

      if (!priceFeedsObjectIds[0]) {
        throw new Error("Failed to get oracle price");
      }

      const tx = new Transaction();
      const splitCoinA = await smartSplitCoin(
        tx,
        coinA.coin_type,
        coinA.decimals,
        coinA.amount,
        address
      );

      const splitCoinB = await smartSplitCoin(
        tx,
        coinB.coin_type,
        coinB.decimals,
        coinB.amount,
        address
      );

      const pack = bcs.tuple([bcs.u64()]);
      const serialized = pack.serialize([0]);
      const slippageBps = 300; // 3%

      const baseParams = [
        tx.object(DUAL_TOKEN_DEPOSIT_CONFIG.price_feed_config),
        tx.object(vaultConfig.pool.pool_address),
        tx.object(vaultConfig.metadata.vault_id),
        tx.object(vaultConfig.metadata.vault_config_id),
        tx.object(priceFeedsObjectIds[0]),
        tx.object(priceFeedsObjectIds[1]),
        tx.object(priceFeedsObjectIds[2]),
        splitCoinA,
        splitCoinB,
        tx.pure.u128(slippageBps),
        tx.pure.u32(tick_lower),
        tx.pure.u32(tick_upper),
        tx.pure.u64(profitData.vault_value_usd),
        tx.pure.u64(new BigNumber(profitData.profit_amount).abs().toString()),
        tx.pure.bool(profitData.negative),
        tx.pure.u64(profitData.expire_time),
        tx.pure.u64(profitData.last_credit_time),
        tx.pure(
          "vector<vector<u8>>",
          [profitData.signer_publickey].map((key) =>
            Array.from(Buffer.from(key, "hex"))
          )
        ),
        tx.pure(
          "vector<vector<u8>>",
          [profitData.signature].map((key) =>
            Array.from(Buffer.from(key, "hex"))
          )
        ),
        tx.pure.vector("u8", serialized.toBytes()),
        tx.object(CLOCK),
      ];

      const _typeArguments: string[] = [
        vaultConfig.collateral_token,
        vaultConfig.vault_lp_token,
        coinA.coin_type,
        coinB.coin_type,
      ];

      const exchangeCode = EXCHANGE_CODES_MAP[vaultConfig.exchange_id]?.code;
      if (!exchangeCode) {
        throw new Error("Invalid exchange code");
      }
      const executorConfig = vaultConfig.metadata.executor[exchangeCode];
      const _arguments: any = [tx.object(executorConfig.config)];

      if (exchangeCode === "mmt") {
        _arguments.push(tx.object(DUAL_TOKEN_DEPOSIT_CONFIG.mmt_version));
      } else if (exchangeCode === "cetus") {
        _arguments.push(
          tx.object(DUAL_TOKEN_DEPOSIT_CONFIG.cetus_global_config)
        );
      } else if (exchangeCode === "bluefin") {
        _arguments.push(
          tx.object(DUAL_TOKEN_DEPOSIT_CONFIG.bluefin_global_config)
        );
      }
      _arguments.push(...baseParams);
      const module = `${exchangeCode}_composer`;
      const target = `${executorConfig.address}::${module}::user_deposit_and_add_liquidity`;
      logger.debug("Dual deposit moveCall target >>", target);
      tx.moveCall({
        target,
        arguments: _arguments,
        typeArguments: _typeArguments,
      });

      const result = await signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: async (data) => {
            const { digest } = data;

            const txResponse = await suiClient.waitForTransaction({
              digest,
              options: {
                showEvents: true,
              },
            });
            const events = txResponse?.events;
            const depositEvent = events.find((event) =>
              event.type.includes("vault::DualTokenDepositEvent")
            );
            const userDualDepositAndAddLiquidityEvent = events.find((event) =>
              event.type.includes("UserDualDepositAndAddLiquidity")
            ) as {
              parsedJson: {
                amount_token_a: string;
                amount_token_b: string;
              };
            };

            // logger.debug("🚀 ~ DepositWithSigTimeEvent:", depositEvent);
            // logger.debug(
            //   "🚀 ~ UserDualDepositAndAddLiquidityEvent:",
            //   userDualDepositAndAddLiquidityEvent
            // );

            onDepositSuccessCallback?.({
              ...data,
              ndlpReceived: (depositEvent?.parsedJson as { lp?: number })?.lp,
              actualInputAmountTokenA:
                userDualDepositAndAddLiquidityEvent?.parsedJson?.amount_token_a,
              actualInputAmountTokenB:
                userDualDepositAndAddLiquidityEvent?.parsedJson?.amount_token_b,
            });
          },
          onError: (error) => {
            console.error("Deposit failed:", error);
            throw error;
          },
        }
      );

      return result;
    } catch (error) {
      console.error("Error in deposit dual:", error);
      throw error;
    }
  };

  return {
    deposit,
  };
};

export const useEstimateDualDeposit = (vaultId: string) => {
  return useQuery({
    queryKey: ["estimate-dual-deposit", vaultId],
    queryFn: () => getEstimateDualDeposit(vaultId),
    refetchInterval: 5000,
  }) as { data: EstimateDualDepositToken; isLoading: boolean };
};
