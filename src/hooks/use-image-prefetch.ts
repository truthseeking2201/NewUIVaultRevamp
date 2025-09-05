import { useCallback, useEffect, useState } from "react";

// Critical images that should be prefetched for better UX
export const CRITICAL_IMAGES = {
  // Wallet icons
  wallets: [
    "/wallets/phantom-wallet.png",
    "/wallets/slush-wallet.png",
    "/wallets/newmoney-wallet.png",
    "/wallets/suiet-wallet.png",
    "/wallets/backpack-wallet.png",
    "/wallets/binance-wallet.png",
    "/wallets/okx-wallet.png",
    "/wallets/gate-wallet.png",
    "/wallets/bitget-wallet.png",
  ],

  bg: [
    "/bg-main.webp",
    "/banners/hero-banner.png",
    "/banners/hero-banner-mobile.png",
  ],

  // Chain icons
  chains: ["/chains/sui.png", "/chains/bsc.png"],

  // Dashboard and UI images
  ui: ["/nodo-logo.png", "/nodo-logo-tm.png"],

  // coins
  coins: [
    "/coins/x_sui.png",
    "/coins/xsui.png",
    "/coins/deep.png",
    "/coins/wbtc.png",
    "/coins/cetus.png",
    "/coins/blue.png",
    "/coins/usdc.png",
    "/coins/nodo-lp.png",
    "/coins/xbtc.png",
    "/coins/ndlp.png",
    "/coins/lbtc.png",
    "/coins/xsui.png",
    "/coins/wal.png",
    "/coins/stsui.png",
    "/coins/sui.png",
    "/coins/xp.png",
    "/coins/xaum.png",
  ],

  // dexs
  dexs: [
    "/dexes/bluefin.png",
    "/dexes/turbos.png",
    "/dexes/flowx.png",
    "/dexes/cetus.png",
    "/dexes/mmt.png",
    "/dexes/pancake.png",
    "/dexes/kriya.png",
  ],

  banners: [
    "/banners/hero-banner.png",
    "/banners/hero-banner-mobile.png",
    "/banners/welcome-icon.png",
  ],
} as const;

export function useImagePrefetch(imageUrls: string[] = []) {
  const prefetchImages = useCallback((urls: string[]) => {
    if (!urls.length) return;
    let loadedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    urls.forEach((url) => {
      const img = new Image();

      img.onload = () => {
        loadedCount++;
      };

      img.onerror = () => {
        failedCount++;
        errors.push(url);
      };

      img.src = url;
    });
  }, []);

  useEffect(() => {
    const imageUrls = Object.values(CRITICAL_IMAGES).flat();
    if (imageUrls.length > 0) {
      prefetchImages(imageUrls);
    }
  }, [prefetchImages]);

  return {
    prefetchImages,
  };
}

// Hook specifically for prefetching critical images
export const useCriticalImagePrefetch = () => {
  return useImagePrefetch();
};
