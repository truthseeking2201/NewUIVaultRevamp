Version 1.2.1 — Mock Mode Scaffolding

Date: 2025-08-26

Summary
- Adds Vite alias flag `VITE_MOCK_MODE` and mock adapters for HTTP, Sui dapp-kit/client/transactions, and Pyth.
- Introduces `src/mocks/http.ts` with fixture-backed routes and `src/mocks/fixtures/*` datasets.
- Provides `src/mocks/mysten-dapp-kit.tsx` for wallet/connect/sign mocks and a `.ts` wrapper re-export.
- Adds `yarn dev:mock` script for running the app fully offline.

Files of note
- vite.config.ts (conditional aliases)
- src/mocks/* (all mocks and fixtures)
- package.json (version bumped to 1.2.1; adds dev:mock)

How to run
- `yarn dev:mock` (or set `VITE_MOCK_MODE=true` and run `yarn dev`).

Revert guidance
- If you use git, tag this commit: `git tag v1.2.1` then `git push --tags`.
- To revert later: `git checkout v1.2.1` (or create a branch from it).
Version 1.2.2 — Vault Detail Loading + Deposit Guards

Date: 2025-08-30

Summary
- Fixes infinite skeleton loop on vault detail by separating loading logic from data presence and adding fallback to list data when basic details are null.
- Adds a clean Not Found state for invalid vault IDs.
- Hardens deposit/dual-deposit forms with null-safe access (lp token + decimals) to prevent runtime crashes before details load.
- Normalizes API URLs to relative paths so axios baseURL is used, avoiding CORS issues like "/undefined/...".

Files of note
- src/pages/vault-detail.tsx (loading, fallback, not-found guard)
- src/apis/vault.ts (relative URLs for basic/histogram/depositTokens)
- src/components/vault-detail/form/deposit/* (null guards and decimals defaults)

How to run
- dev with mocks: `yarn dev` (VITE_MOCK_MODE=true)
- build: `yarn build`

Revert guidance
- If you use git, tag this version as v1.2.2. To revert later: `git checkout v1.2.2`.

Version 1.2.3 — Withdraw Cooldown + NDLP Mock + Activities/Analytics

Date: 2025-09-04

Summary
- Force-display balances for demo: NDLP = 1,000,000 in wallet dropdown and Manage Liquidity → Withdraw; USDC on header already forced previously.
- Skip wallet interactions (mock): Deposit and Withdraw/Claim return immediate success with digest `0xMOCK`.
- Add 20s claim cooldown: after Withdraw confirmation, a pending entry appears and automatically becomes claimable after ~20 seconds.
- Vault Activities: add rich fixtures and normalize mock router to return `{ list, total, page, limit }` shape.
- Vault Analytics: normalize histogram mock data into the chart-compatible `{ list: [{ value: { date, apy, lp_fee, acc_lp_fee, lower, upper, real } }] }`.

Files of note
- src/components/wallet/ndlp-tokens.tsx (NDLP display = 1,000,000)
- src/components/vault-detail/form/withdraw/withdraw-form.tsx (success modal + pending claim model)
- src/components/vault-detail/form/withdraw/withdraw-vault-section.tsx (cooldown + local claim state transitions)
- src/hooks/use-withdraw-vault.ts (mock withdraw/redeem)
- src/mocks/http.ts (analytics + activities normalization)
- src/mocks/fixtures/vault-activities-by-id.json (fixture data)

How to run
- Dev with mocks: `yarn dev` (VITE_MOCK_MODE=true)

Revert guidance
- Tag this commit: `git tag v1.2.3` then `git push --tags`.
- To revert later: `git checkout v1.2.3` (or create a branch from it).

Version 1.2.4 — Rename “Manage My Position” to “Your Holdings”

Date: 2025-09-04

Summary
- Renames all UI labels from “Manage My Position” to “Your Holdings” across vault detail tabs, list columns, mobile rows, section titles, and activity link text.
- Keeps routing/tab keys unchanged (still `?tab=position`) and preserves layout and sticky aside behavior. No functional logic changes.

Files of note
- src/pages/vault-detail.tsx (tab label)
- src/components/vault/list/vault-list.tsx (table column label)
- src/components/vault/list/vault-item-mobile.tsx (mobile row label)
- src/components/vault-detail/activities/desktop.tsx (link copy)
- src/components/vault-detail/sections/your-holdings.tsx (section title)
- package.json (version bumped to 1.2.4)

How to run
- Dev with mocks: `yarn dev` (VITE_MOCK_MODE=true)
- Build: `yarn build`

Revert guidance
- If using git, tag this version as v1.2.4. To revert later: `git checkout v1.2.4`.
