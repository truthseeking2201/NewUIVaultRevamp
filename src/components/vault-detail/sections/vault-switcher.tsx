import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatVaultNameDisplay } from "@/lib/utils";
import { useGetDepositVaults } from "@/hooks";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function VaultSwitcher() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const { vault_id: currentVaultId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: vaults = [], isLoading, isFetching, error } = useGetDepositVaults();

  const mapped = useMemo(() => {
    return vaults.map((vault) => {
      const fallbackExchange = {
        code: "unknown",
        name: `Exchange ${vault?.exchange_id ?? ""}`.trim(),
        image: "/dexs/cetus.png",
      };
      const exchange = EXCHANGE_CODES_MAP[vault?.exchange_id] || fallbackExchange;

      const poolName = vault?.pool?.pool_name || "";
      const normalizedPoolName = poolName.replace(/\//g, "-");
      const tokens = normalizedPoolName ? normalizedPoolName.split("-") : [];

      return {
        id: vault.vault_id,
        name: vault.vault_name,
        exchangeName: exchange.name,
        exchangeImage: exchange.image,
        tokens,
      };
    });
  }, [vaults]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mapped;
    return mapped.filter((v) => {
      return (
        v.name.toLowerCase().includes(q) ||
        v.exchangeName.toLowerCase().includes(q) ||
        v.tokens.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [mapped, query]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const el = listRef.current?.children?.[activeIndex] as HTMLElement | undefined;
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const onSelect = (nextId: string) => {
    setOpen(false);
    if (!nextId || nextId === currentVaultId) return;
    const qs = new URLSearchParams(searchParams);
    const tab = (qs.get("tab") as "overview" | "activity" | "position") || "overview";
    qs.set("tab", tab);
    navigate(`/vault/${nextId}?${qs.toString()}`);
    try {
      (window as any)?.analytics?.track?.("vault_switch", { from: currentVaultId, to: nextId });
    } catch {}
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) onSelect(item.id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const isBusy = isLoading || isFetching;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Change vault"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            // Size & shape (exact radius request)
            "h-8 w-8 ml-1 inline-flex items-center justify-center rounded-[53.333px]",
            // Border & background per request
            "border border-white/30 bg-black",
            // Icon color
            "text-muted-foreground",
            // Focus ring & transitions retained
            "focus:outline-none focus:ring-2 focus:ring-ring transition-colors transition-transform"
          )}
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("w-[min(560px,90vw)] p-0 bg-[#111] text-white border-white/10")}
        onKeyDown={onKeyDown}
      >
        <div className="p-3 border-b border-white/10">
          <Input
            ref={inputRef}
            placeholder="Search vaults…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search vaults"
          />
        </div>

        {/* Content states */}
        {isBusy ? (
          <ul className="max-h-[60vh] overflow-auto p-3 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-8 h-8 rounded-full -ml-2" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </li>
            ))}
          </ul>
        ) : error ? (
          <div className="p-4 text-sm text-white/70">Failed to load vaults.</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-sm text-white/70">No vaults found.</div>
        ) : (
          <ul
            ref={listRef}
            role="listbox"
            aria-label="Vaults"
            className="max-h-[60vh] overflow-auto py-2"
          >
            {filtered.map((v, idx) => {
              const isActive = v.id === currentVaultId;
              const isFocused = idx === activeIndex;
              return (
                <li
                  key={v.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => onSelect(v.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 cursor-pointer",
                    "hover:bg-white/10",
                    isFocused && "bg-white/10"
                  )}
                >
                  {/* Pair icons */}
                  <div className="flex items-center justify-center">
                    {v.tokens?.map((token, i) => (
                      <img
                        key={`${v.id}-${token}-${i}`}
                        src={`/coins/${token?.toLowerCase()}.png`}
                        alt={token}
                        className={cn("w-8 h-8 rounded-full", i > 0 && "-ml-2")}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">
                      {formatVaultNameDisplay(v.name)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/70 truncate">
                      <img src={v.exchangeImage} alt={v.exchangeName} className="h-3" />
                      <span className="truncate">{v.exchangeName}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
