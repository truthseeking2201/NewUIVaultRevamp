import { useState, useEffect } from "react";

const RIBBON_KEY = "ribbonDismissed";

export function setRibbonDismissed() {
  localStorage.setItem(RIBBON_KEY, "dismissed");
}

export function getRibbonDismissed(): boolean {
  return !!localStorage.getItem(RIBBON_KEY);
}

export function useRibbon(): [boolean, (v: boolean) => void] {
  const [visibleRibbon, setVisibleRibbon] = useState(false);
  useEffect(() => {
    setVisibleRibbon(!getRibbonDismissed());
  }, []);
  return [visibleRibbon, setVisibleRibbon];
}
