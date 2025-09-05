import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const container = document.getElementById("main-layout-content");
    if (container) {
      container.scrollTo({ top: 0 });
    }
  }, [pathname]);

  return null;
}
