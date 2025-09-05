import { useEffect, useState, useCallback } from "react";
import { ArrowDown } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = document.getElementById("main-layout-content");
    if (!container) return;

    const onScroll = () => {
      setVisible(container.scrollTop > 300);
    };
    container.addEventListener("scroll", onScroll);

    onScroll();
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = useCallback(() => {
    const container = document.getElementById("main-layout-content");
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <Button
      aria-label="Scroll to top"
      onClick={handleClick}
      className={cn(
        "fixed bottom-8 right-8 z-50 p-3 rounded-full bg-gradient-to-tr from-brand-500 via-brand-400 to-brand-300 shadow-lg transition-all duration-500",
        "hover:scale-110 hover:shadow-2xl active:scale-95 bg-white/20",
        visible ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none translate-y-8"
      )}
      variant="icon"
    >
      <span className="block transition-transform duration-500" style={{ transform: "rotate(180deg)" }}>
        <ArrowDown className="w-8 h-8 text-white" />
      </span>
    </Button>
  );
} 