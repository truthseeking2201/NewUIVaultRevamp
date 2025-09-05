import { useToast } from "@/hooks/use-toast";
import { initVersionChecker } from "@/utils/version-checker";
import { useEffect, useState } from "react";

const DEFAULT_DURATION = 30000;

const VersionChecker = () => {
  const { toast } = useToast();
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const showInfo = () => {
    toast({
      title: "A new version is available. Click here to refresh.",
      variant: "success",
      duration: DEFAULT_DURATION,
      onClick: () => {
        location.reload();
        return false;
      },
      className: "cursor-pointer",
      hideClose: false,
    });
  };
  useEffect(() => {
    initVersionChecker(showInfo, setAppVersion).catch((error) => {
      console.error("Failed to initialize version checker:", error);
    });
  }, []);

  return (
    <div
      className="font-sans text-white w-[76px] h-[30px]"
      onClick={() => setCount(count + 1)}
    >
      {count > 5 && <span>Version {appVersion}</span>}
    </div>
  );
};

export default VersionChecker;
