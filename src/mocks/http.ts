// Lightweight mock HTTP router. Returns already-unwrapped data shapes.
// Map the backend endpoints used under src/apis/* to local fixtures.

type AnyObj = Record<string, any>;

function normalize(url: string) {
  try {
    const u = url.startsWith("http") ? new URL(url) : new URL(url, "http://x");
    return { pathname: u.pathname, searchParams: u.searchParams };
  } catch {
    return { pathname: url, searchParams: new URLSearchParams() };
  }
}

// Fixtures
import depositVaults from "./fixtures/deposit-vaults.json";
import vaultBasicById from "./fixtures/vault-basic-by-id.json";
import vaultAnalyticsById from "./fixtures/vault-analytics-by-id.json";
import vaultActivitiesById from "./fixtures/vault-activities-by-id.json";
import withdrawalsByWallet from "./fixtures/withdrawals-by-wallet.json";
import withdrawalLatest from "./fixtures/withdrawal-latest.json";
import userHoldingByVault from "./fixtures/user-holding-by-vault.json";
import estimateDepositByVault from "./fixtures/estimate-deposit-by-vault.json";
import estimateWithdrawByVault from "./fixtures/estimate-withdraw-by-vault.json";
import estimateWithdrawDualByVault from "./fixtures/estimate-withdraw-dual-by-vault.json";
import estimateDualDepositByVault from "./fixtures/estimate-dual-deposit-by-vault.json";
import swapDepositInfoByVault from "./fixtures/swap-deposit-info-by-vault.json";
import depositTokens from "./fixtures/deposit-tokens.json";
import tokenPrices from "./fixtures/token-prices.json";
import ndlpPrices from "./fixtures/ndlp-prices.json";
import walletDetail from "./fixtures/wallet-detail.json";
import affiliateDashboard from "./fixtures/affiliate-dashboard.json";
import profitDataByVault from "./fixtures/profit-data-by-vault.json";

function ok<T>(data: T) {
  return Promise.resolve(data as any);
}
function err(message: string, status = 404) {
  const e: any = new Error(message);
  e.response = { status, data: { message } };
  return Promise.reject(e);
}

const http = {
  async get(url: string, _config?: AnyObj) {
    const { pathname, searchParams } = normalize(url);

    // Wallet / Affiliate
    if (pathname.endsWith("/data-management/external/user/wallet-detail")) {
      return ok(walletDetail);
    }
    if (pathname.endsWith("/data-management/external/user/my-affiliate-dashboard")) {
      return ok(affiliateDashboard);
    }

    // Vault lists & withdrawals
    if (pathname.endsWith("/data-management/external/vaults/list")) {
      return ok(depositVaults);
    }
    if (pathname.endsWith("/data-management/external/vaults/withdrawals")) {
      return ok(withdrawalsByWallet);
    }

    // Vault analytics histogram -> normalize to { list: [{ value: { date, apy, lp_fee, acc_lp_fee, lower, upper, real } }, ...] }
    if (pathname.includes("/data-management/external/vaults/") && pathname.endsWith("/histogram")) {
      const parts = pathname.split("/");
      const vaultId = parts[parts.indexOf("vaults") + 1];
      const type = searchParams.get("histogram_type") || "POSITION_PRICE"; // POSITION_PRICE | APY_YIELDS
      const range = searchParams.get("histogram_range") || "ONE_DAY"; // ONE_DAY | ONE_WEEK

      // Deterministic seed per vault + range so UI is stable
      function mulberry32(a: number) {
        return function () {
          let t = (a += 0x6d2b79f5);
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }

      const seed = (vaultId || "").length + (type === "APY_YIELDS" ? 17 : 3) + (range === "ONE_WEEK" ? 101 : 7);
      const rng = mulberry32(seed);

      const now = Date.now();
      const points = range === "ONE_WEEK" ? 168 : 24; // hourly points
      const stepMs = 60 * 60 * 1000; // 1 hour

      // Start at base price near 1 with small random walk
      let price = 1 + (rng() - 0.5) * 0.04; // ~1.00 ± 2%
      let accLp = 0;

      const list: any[] = [];
      for (let i = points - 1; i >= 0; i--) {
        // Time oldest -> newest
        const ts = new Date(now - i * stepMs).toISOString();
        // Random walk for price
        const drift = (rng() - 0.5) * 0.01; // ±1%
        price = Math.max(0.5, price * (1 + drift));
        const lower = price * 0.98;
        const upper = price * 1.02;
        // APY & fees
        const apy = 10 + (rng() - 0.5) * 5; // 10% ±2.5%
        const lp_fee = Math.max(0, apy / 100 / 365 / 24); // hourly fraction
        accLp += lp_fee;
        list.push({
          value: {
            date: ts,
            apy,
            lp_fee,
            acc_lp_fee: accLp,
            lower,
            upper,
            real: price,
          },
        });
      }

      // If fixture data exists, we can append it at the end for diversity
      const raw = (vaultAnalyticsById as AnyObj)[vaultId] || [];
      if (Array.isArray(raw) && raw.length) {
        for (const d of raw) {
          const date = new Date((d.t || d.date || now / 1000) * 1000).toISOString();
          const apy = Number(d.apy ?? 0);
          const price = Number(d.price ?? 1);
          const lp_fee = Number(d.lp_fee ?? Math.max(0, apy / 100 / 365 / 24));
          accLp += lp_fee;
          list.push({
            value: {
              date,
              apy,
              lp_fee,
              acc_lp_fee: accLp,
              lower: price * 0.98,
              upper: price * 1.02,
              real: price,
            },
          });
        }
      }

      return ok({ list });
    }

    // Vault basic details (absolute URL path joins are used in apis)
    if (pathname.includes("/data-management/external/vaults/") && pathname.endsWith("/basic")) {
      const parts = pathname.split("/");
      const vaultId = parts[parts.indexOf("vaults") + 1];
      const basic = (vaultBasicById as AnyObj)[vaultId];
      if (basic) return ok(basic);
      // Fallback: derive a minimal basic detail from depositVaults if fixture is missing
      const derived = (depositVaults as any[]).find((v) => v.vault_id === vaultId);
      if (derived) {
        return ok({
          id: vaultId,
          vault_id: vaultId,
          vault_name: derived.vault_name,
          vault_address: derived.vault_address,
          vault_module: derived.vault_module,
          collateral_token: derived.collateral_token,
          collateral_token_decimals: derived.collateral_token_decimals,
          vault_lp_token: derived.vault_lp_token,
          vault_lp_token_decimals: derived.vault_lp_token_decimals,
          total_value_usd: derived.total_value_usd,
          pool_total_value_usd: Number(derived.total_value_usd || 0),
          pool_apr: derived.vault_apy,
          vault_apr: derived.vault_apy,
          vault_apy: derived.vault_apy,
          ndlp_price: derived.ndlp_price_usd,
          ndlp_price_usd: derived.ndlp_price_usd,
          rewards_24h_usd: derived.rewards_24h_usd,
          pool: derived.pool,
          exchange_id: derived.exchange_id,
          user_pending_withdraw_ndlp: derived.user_pending_withdraw_ndlp,
        });
      }
      return ok(null);
    }

    // Estimate endpoints
    if (pathname.includes("/estimate-deposit-dual")) {
      const parts = pathname.split("/");
      const vaultId = parts[parts.indexOf("vaults") + 1];
      return ok(estimateDualDepositByVault[vaultId]);
    }
    if (pathname.includes("/estimate-deposit")) {
      const parts = pathname.split("/");
      const vaultId = parts[parts.indexOf("vaults") + 1];
      return ok(estimateDepositByVault[vaultId]);
    }
    if (pathname.includes("/estimate-withdraw-dual")) {
      const parts = pathname.split("/");
      const vaultId = parts[parts.indexOf("vaults") + 1];
      return ok(estimateWithdrawDualByVault[vaultId]);
    }
    if (pathname.includes("/estimate-withdraw")) {
      const parts = pathname.split("/");
      const vaultId = parts[parts.indexOf("vaults") + 1];
      return ok(estimateWithdrawByVault[vaultId]);
    }

    // Profit data (signature)
    if (pathname.includes("/profit-data")) {
      const parts = pathname.split("/");
      const vaultId = parts[parts.indexOf("vaults") + 1];
      return ok(profitDataByVault[vaultId]);
    }

    // Swap and deposit info
    if (pathname.includes("/swap-and-deposit-info")) {
      const parts = pathname.split("/");
      const vaultId = parts[parts.indexOf("vaults") + 1];
      return ok(swapDepositInfoByVault[vaultId]);
    }

    // Activities -> normalize to { list, total, page, limit }
    // Requirements:
    // - Provide 5,000 activities per vault with pagination
    // - Support filter via action_type: "SWAP" | "ADD_LIQUIDITY" | "REMOVE_LIQUIDITY" | ""
    // - Data changes every 1 minute (deterministic based on the current minute)
    if (pathname.endsWith("/data-management/external/position-requests")) {
      const vaultId = searchParams.get("vault_id") || "0xV001";
      const page = Math.max(1, Number(searchParams.get("page") || 1));
      const limit = Math.max(1, Number(searchParams.get("limit") || 5));
      const actionType = (searchParams.get("action_type") || "").toUpperCase();

      // If fixture exists and is large enough, we can still return it untouched when not requesting 5k.
      // Otherwise generate synthetic data to reach 5,000 items with stable shape.

      // Deterministic PRNG (mulberry32) so results are stable within the same minute
      function mulberry32(a: number) {
        return function () {
          let t = (a += 0x6d2b79f5);
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }

      const now = Date.now();
      const minuteSeed = Math.floor(now / 60000); // changes every 1 minute
      const rng = mulberry32(minuteSeed + vaultId.length);

      const TYPES = ["ADD_LIQUIDITY", "REMOVE_LIQUIDITY", "SWAP", "OPEN", "CLOSE"] as const;
      type TType = (typeof TYPES)[number];

      const chooseType = (i: number): TType => {
        // Bias a little differently per minute
        const r = rng() + (i % 5) * 0.01;
        if (r < 0.25) return "ADD_LIQUIDITY";
        if (r < 0.45) return "REMOVE_LIQUIDITY";
        if (r < 0.75) return "SWAP";
        if (r < 0.9) return "OPEN";
        return "CLOSE";
      };

      const toFixed = (n: number, d = 2) => Number(n.toFixed(d));

      // Build one row given index
      const buildRow = (i: number) => {
        const type = chooseType(i);
        // Spread timestamps back in time, newest first
        const time = new Date(now - i * 60_000).toISOString();

        // Pricing & decimals
        const USDC_DEC = 6;
        const SUI_DEC = 9;
        const USDC_PRICE = 1.0;
        const SUI_PRICE = 4.0;

        const toUnits = (v: number, dec: number) => Math.round(v * Math.pow(10, dec));
        const fromUnits = (v: number, dec: number) => v / Math.pow(10, dec);

        // Generate display amounts
        const usdcInDisplay = 100 + rng() * 1000; // $100..$1100
        const suiOutDisplay = usdcInDisplay / SUI_PRICE * (0.995 + rng() * 0.01);

        const usdcToken = {
          token_id: 1,
          token_name: "USDC",
          token_symbol: "USDC",
          token_address: "0xUSDC",
          decimal: USDC_DEC,
          amount: toUnits(usdcInDisplay, USDC_DEC),
          price: USDC_PRICE.toFixed(2),
          url: "",
          createdAt: time,
          updatedAt: time,
        };
        const suiToken = {
          token_id: 3,
          token_name: "SUI",
          token_symbol: "SUI",
          token_address: "0xSUI",
          decimal: SUI_DEC,
          amount: toUnits(suiOutDisplay, SUI_DEC),
          price: SUI_PRICE.toFixed(2),
          url: "",
          createdAt: time,
          updatedAt: time,
        };

        // Smaller pair values for add/remove/open/close
        const usdcPairDisplay = (10 + rng() * 50) / 1000; // 0.01..0.06
        const suiPairDisplay = usdcPairDisplay / SUI_PRICE * (0.98 + rng() * 0.04);
        const usdcPair = { ...usdcToken, amount: toUnits(usdcPairDisplay, USDC_DEC) };
        const suiPair = { ...suiToken, amount: toUnits(suiPairDisplay, SUI_DEC) };

        let tokens;
        let valueUsd = 0;
        switch (type) {
          case "ADD_LIQUIDITY":
          case "OPEN":
            tokens = [usdcPair, suiPair];
            valueUsd = usdcPairDisplay * USDC_PRICE + suiPairDisplay * SUI_PRICE;
            break;
          case "REMOVE_LIQUIDITY":
          case "CLOSE":
            tokens = [usdcPair, suiPair];
            valueUsd = usdcPairDisplay * USDC_PRICE + suiPairDisplay * SUI_PRICE;
            break;
          default:
            tokens = [usdcToken, suiToken];
            const inUsd = fromUnits(usdcToken.amount, USDC_DEC) * USDC_PRICE;
            const outUsd = fromUnits(suiToken.amount, SUI_DEC) * SUI_PRICE;
            valueUsd = Math.min(inUsd, outUsd);
        }

        const reasonMap: Record<TType, string[]> = {
          ADD_LIQUIDITY: [
            "Deploy new deposits to active range",
            "Increase position size",
            "Rebalance capital into range",
          ],
          REMOVE_LIQUIDITY: [
            "Reduce SUI exposure (protective posture)",
            "Trim position after volatility spike",
            "Harvest fees and reduce risk",
          ],
          SWAP: [
            "Restore target 65/35 mix",
            "Recenter range",
            "Reduce exposure",
          ],
          OPEN: [
            "Cooldown ended; re-enter balanced range",
            "Initialize range after strategy update",
          ],
          CLOSE: [
            "Stop-loss triggered; exit LP",
            "Exit to stablecoins due to drawdown",
          ],
        };
        const pick = (arr: string[]) => arr[Math.floor(rng() * arr.length)] || "";

        const txhash = `0x${(minuteSeed % 4096).toString(16)}${i
          .toString(16)
          .padStart(6, "0")}`;

        return {
          type,
          time,
          vault_address: vaultId,
          tokens,
          txhash,
          status: "success",
          id: `${vaultId}-${minuteSeed}-${i}`,
          value: String(toFixed(valueUsd, 2)),
          reason: pick(reasonMap[type]),
        };
      };

      const TARGET_TOTAL = 5000;

      // If we have fixture list for this vault, append synthetic rows until we reach TARGET_TOTAL
      const raw = ((vaultActivitiesById as AnyObj)[vaultId] || { list: [] }) as {
        list: any[];
        total?: number;
      };
      const fixtureList = Array.isArray(raw.list) ? raw.list : [];

      // Generate synthetic rows
      const synth = Array.from({ length: Math.max(0, TARGET_TOTAL - fixtureList.length) }, (_, idx) =>
        buildRow(idx)
      );
      // Prepend fixture rows as the latest if any, then synthetic rows
      let fullList = [...fixtureList, ...synth];

      // Apply filter if provided
      if (
        actionType === "SWAP" ||
        actionType === "ADD_LIQUIDITY" ||
        actionType === "REMOVE_LIQUIDITY" ||
        actionType === "OPEN" ||
        actionType === "CLOSE"
      ) {
        fullList = fullList.filter((it) => it.type === actionType);
      }

      // Optional: filter by time range
      const timeRange = (searchParams.get("time_range") || "").toLowerCase();
      if (timeRange === "24h" || timeRange === "7d") {
        const nowMs = Date.now();
        const threshold = timeRange === "24h" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
        fullList = fullList.filter((it) => nowMs - new Date(it.time).getTime() <= threshold);
      }

      const total = fullList.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const list = fullList.slice(start, end);

      return ok({ list, total, page, limit });
    }

    // Latest withdrawal
    if (pathname.endsWith("/data-management/external/withdrawals/latest")) {
      return ok(withdrawalLatest);
    }

    // User holding
    if (pathname.includes("/data-management/external/user/vault-stats")) {
      const vaultId = searchParams.get("vault_id") || "";
      const ndlpBalanceStr = searchParams.get("ndlp_balance") || "0";
      const fixture = (userHoldingByVault as AnyObj)[vaultId];
      if (fixture) return ok(fixture);

      // Synthesize a reasonable holding payload for any vault ID
      const vaultRow = (depositVaults as any[]).find((v) => v.vault_id === vaultId);
      const priceStr = (vaultRow?.ndlp_price_usd as string) || "1.02";
      const price = Number(priceStr) || 1.02;
      const ndlpBal = Number(ndlpBalanceStr) || 0;
      const liquidityUSD = Math.max(0, ndlpBal * price);

      // Split into USDC/SUI for the breakdown
      const usdcUsd = liquidityUSD * 0.7;
      const suiUsd = liquidityUSD * 0.3;
      const suiPrice = 4.0;
      const result = {
        vault_id: vaultId,
        user_wallet: "0xFAKEDEADBEEF",
        code: "ABC",
        timestamp: new Date().toISOString(),
        user_ndlp_balance: ndlpBal,
        ndlp_price: priceStr,
        ndlp_price_usd: priceStr,
        user_total_liquidity_usd: liquidityUSD,
        user_total_rewards_usd: liquidityUSD > 0 ? Math.max(0.01, liquidityUSD * 0.001) : 0,
        user_total_deposit: liquidityUSD,
        user_total_deposit_usd: liquidityUSD,
        user_rewards_24h_usd: liquidityUSD > 0 ? Math.max(0.01, liquidityUSD * 0.0002) : 0,
        user_shares_percent: 0.05,
        user_break_event_price: price,
        user_break_event_price_usd: price,
        user_total_withdraw_usd: 0,
        user_vault_tokens: [
          {
            token: "USDC",
            token_name: "USDC",
            token_symbol: "USDC",
            amount: usdcUsd,
            amount_in_usd: usdcUsd,
          },
          {
            token: "SUI",
            token_name: "SUI",
            token_symbol: "SUI",
            amount: suiUsd / suiPrice,
            amount_in_usd: suiUsd,
          },
        ],
        user_vault_rewards: [],
      };
      return ok(result);
    }

    // LP Breakdown (secure snapshot ~1h)
    if (/\/data-management\/external\/vaults\/.+\/lp-breakdown$/.test(pathname)) {
      const asOf = new Date().toISOString();
      const slices = [
        { label: 'USDC', percent: 62.0, usd: 5280.0, color: '#52BDE1' },
        { label: 'SUI', percent: 38.0, usd: 3248.0, color: '#CC98FF' },
      ];
      return ok({ asOf, slices });
    }

    // Deposit tokens
    if (pathname.includes("data-management/external/vaults/list-deposit-tokens")) {
      return ok(depositTokens);
    }

    return err(`Mock GET not mapped: ${pathname}`);
  },

  async post(url: string, body?: AnyObj, _config?: AnyObj) {
    const { pathname } = normalize(url);

    // Prices
    if (pathname.endsWith("/data-management/external/vaults/token-prices")) {
      return ok(tokenPrices);
    }
    if (pathname.endsWith("/data-management/external/vaults/ndlp-prices")) {
      return ok(ndlpPrices);
    }

    // Referral & subscription
    if (pathname.endsWith("/data-management/external/user/subscribe")) {
      return ok({ success: true });
    }
    if (pathname.endsWith("/data-management/external/user/update-wallet-provider")) {
      return ok({ success: true });
    }
    if (pathname.endsWith("/data-management/external/user/invite-code")) {
      if (!body?.invite_code) return err("Missing invite_code", 400);
      return ok({ success: true });
    }
    if (pathname.endsWith("/data-management/external/user/skip-invite-code")) {
      return ok({ success: true });
    }

    // Execute withdrawals
    if (pathname.endsWith("/data-management/external/withdrawals")) {
      return ok({ success: true, digest: "0xMOCK" });
    }

    return err(`Mock POST not mapped: ${pathname}`);
  },
};

export default http;
