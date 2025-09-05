import { cn } from "@/lib/utils";
import { X } from "lucide-react";

type Props = {
  className?: string;
};

const IconErrorToast = (props: Props) => {
  return (
    <div
      className={cn(
        "flex justify-between items-center flex-shrink-0",
        props?.className
      )}
    >
      <div className="flex justify-between items-center border border-4 border-[#303746] rounded-full animate-pulse-glow	">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          viewBox="0 0 25 25"
          fill="none"
        >
          <mask
            id="mask0_706_2800"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="25"
            height="25"
          >
            <rect
              x="0.878906"
              y="0.317383"
              width="24"
              height="24"
              fill="#D9D9D9"
            />
          </mask>
          <g mask="url(#mask0_706_2800)">
            <path
              d="M9.27891 17.3174L12.8789 13.7174L16.4789 17.3174L17.8789 15.9174L14.2789 12.3174L17.8789 8.71738L16.4789 7.31738L12.8789 10.9174L9.27891 7.31738L7.87891 8.71738L11.4789 12.3174L7.87891 15.9174L9.27891 17.3174ZM12.8789 22.3174C11.4956 22.3174 10.1956 22.0547 8.97891 21.5294C7.76224 21.0047 6.70391 20.2924 5.80391 19.3924C4.90391 18.4924 4.19157 17.434 3.66691 16.2174C3.14157 15.0007 2.87891 13.7007 2.87891 12.3174C2.87891 10.934 3.14157 9.63405 3.66691 8.41738C4.19157 7.20072 4.90391 6.14238 5.80391 5.24238C6.70391 4.34238 7.76224 3.62972 8.97891 3.10438C10.1956 2.57972 11.4956 2.31738 12.8789 2.31738C14.2622 2.31738 15.5622 2.57972 16.7789 3.10438C17.9956 3.62972 19.0539 4.34238 19.9539 5.24238C20.8539 6.14238 21.5662 7.20072 22.0909 8.41738C22.6162 9.63405 22.8789 10.934 22.8789 12.3174C22.8789 13.7007 22.6162 15.0007 22.0909 16.2174C21.5662 17.434 20.8539 18.4924 19.9539 19.3924C19.0539 20.2924 17.9956 21.0047 16.7789 21.5294C15.5622 22.0547 14.2622 22.3174 12.8789 22.3174Z"
              fill="#F04248"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export { IconErrorToast };
