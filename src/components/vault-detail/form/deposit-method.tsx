import { METHOD_DEPOSIT } from "@/components/vault-detail/constant";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type Props = {
  className?: string;
  method: (typeof METHOD_DEPOSIT)[keyof typeof METHOD_DEPOSIT];
};

const DepositMethod = ({ method, className }: Props) => {
  const data = useMemo(() => {
    const isDual = method === METHOD_DEPOSIT.DUAL;
    return {
      class: isDual ? "bg-[#A9FF52]" : "bg-[#52DCFF]",
      label: isDual ? "DUAL TOKEN" : "SINGLE TOKEN",
    };
  }, [method]);
  return (
    <div
      className={cn(
        "text-sans text-[11px] md:text-sm max-md:leading-[16px] font-bold text-ai-dark px-2 py-0.5 rounded-[39px]",
        data.class,
        className
      )}
    >
      {data.label}
    </div>
  );
};

export default DepositMethod;
