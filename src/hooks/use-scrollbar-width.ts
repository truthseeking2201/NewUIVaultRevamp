import { useState, useEffect } from "react";

export function useScrollbarWidth() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const scrollDiv = document.createElement("div");
    scrollDiv.style.width = "100px";
    scrollDiv.style.height = "100px";
    scrollDiv.style.overflow = "scroll";
    scrollDiv.style.position = "absolute";
    scrollDiv.style.top = "-9999px";
    document.body.appendChild(scrollDiv);

    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    setWidth(scrollbarWidth);

    // Safety check to ensure the element exists before removing it
    if (scrollDiv.parentNode) {
      document.body.removeChild(scrollDiv);
    }
  }, []);

  return width;
} 