import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";

interface ItemRowProps {
  className?: string;
  title?: string;
  value?: string;
  isNew?: boolean;
}

const RowV2 = ({ handleCopy, value }) => {
  return (
    <div className="bg-black border border-gray-700 rounded-[12px]">
      <Button
        variant="icon"
        onClick={handleCopy}
        className="flex items-center justify-between w-full text-left bg-black rounded-[14px] px-4 py-1 group hover:bg-white/10"
      >
        <span className="text-lg font-medium text-white block truncate pr-4 font-mono">
          {value}
        </span>
        <Copy className="bg-white rounded-md p-[6px] !w-6 !h-6" stroke="black" />
      </Button>
    </div>
  );
};

const OldRow = ({ title, handleCopy, value }) => {
  return (
    <div>
      <div className="text-075 text-sm mb-2">{title}</div>
      <div className="bg-gradient-to-r from-[#F2BB89] via-[#F3D2B5] to-[#F5C8A4] rounded-[14px]	p-[1px]">
        <Button
          variant="icon"
          onClick={handleCopy}
          className="relative w-full text-left bg-black rounded-[14px] p-4 group"
        >
          <span className="text-lg font-medium text-white block truncate pr-4 font-mono">
            {value}
          </span>
          <Copy className="bg-white rounded-md p-1 !w-6 !h-6" stroke="black" />
        </Button>
      </div>
    </div>
  );
};

export function ItemRow({
  className = "",
  title = "",
  value = "",
  isNew = false,
}: ItemRowProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(value);
      toast({
        variant: "success",
        title: "Referral code copied",
        description: "Referral code copied to clipboard",
        duration: 2000,
      });
    }
  };

  return (
    <div className={`${className}`}>
      {isNew ? (
        <RowV2 handleCopy={handleCopy} value={value} />
      ) : (
        <OldRow title={title} handleCopy={handleCopy} value={value} />
      )}
    </div>
  );
}
