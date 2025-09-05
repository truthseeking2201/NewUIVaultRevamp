import greenCheck from "@/assets/icons/green-check.png";
import { X } from "lucide-react";
import { memo } from "react";

const SuccessfulToast = ({
  title,
  content,
  closeToast,
}: {
  title: string;
  content: string;
  closeToast: () => void;
}) => {
  return (
    <div className="flex items-center gap-2 font-sans relative p-1">
      <div className="absolute top-[-25px] left-[-40px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle
            cx="32"
            cy="32.0005"
            r="120"
            fill="url(#paint0_radial_1087_11798)"
            fillOpacity="0.13"
          />
          <defs>
            <radialGradient
              id="paint0_radial_1087_11798"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(32 32.0005) rotate(90) scale(120)"
            >
              <stop stopColor="#10B981" />
              <stop offset="1" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <X
        size={20}
        className="text-white absolute top-0 right-[-10px] cursor-pointer h-6 w-6"
        onClick={closeToast}
      />
      <div className="pr-2">
        <img src={greenCheck} alt="green check" />
      </div>
      <div className="flex flex-col">
        <div className="text-[17px] font-semibold mb-1">{title}</div>
        <div className="text-[#C8C5C5] text-sm">{content}</div>
      </div>
    </div>
  );
};

export default memo(SuccessfulToast);
