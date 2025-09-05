import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface DelayRenderProps {
  children: React.ReactNode;
  delay?: number;
}

export const DelayRender: React.FC<DelayRenderProps> = ({
  children,
  delay = 500,
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!shouldRender) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};
