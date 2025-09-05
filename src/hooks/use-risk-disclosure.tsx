const RISK_DISCLOSURE_KEY = "disclaimerDismissed";

function setWarningDismissed() {
  localStorage.setItem(RISK_DISCLOSURE_KEY, "dismissed");
}

function getWarningDismissed(): boolean {
  return !!localStorage.getItem(RISK_DISCLOSURE_KEY);
}

export function useRiskDisclosure(): {
  visibleDisclaimer: boolean;
  setVisibleDisclaimer: () => void;
} {
  return {
    visibleDisclaimer: !getWarningDismissed(),
    setVisibleDisclaimer: setWarningDismissed,
  };
}
