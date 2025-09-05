import { useEffect, useState } from "react";
import useBreakpoint from "./use-breakpoint";

export const useIsChromeDesktop = () => {
  const [isChromeDesktop, setIsChromeDesktop] = useState(true);
  const { isLg } = useBreakpoint();

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
    const isDesktop = !/mobile|android|iphone|ipad|ipod/.test(userAgent);
    const isSupportedBrowser = isChrome && isDesktop && isLg;

    setIsChromeDesktop(isSupportedBrowser);
  }, [isLg]);

  return { isChromeDesktop };
};
