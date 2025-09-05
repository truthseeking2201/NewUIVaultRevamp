import chevronRight from "@/assets/icons/chevron-right.svg";

const DcaStrategy = () => {
  return (
    <div
      className="flex flex-row items-center gap-1 cursor-pointer"
      onClick={() => {
        window.open(
          "https://docs.nodo.xyz/public/vault-mechanics-and-on-chain-architecture/dca-strategy",
          "_blank"
        );
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="19"
        height="19"
        viewBox="0 0 19 19"
        fill="none"
        className="max-md:w-[14px] max-md:h-[14px] w-[18px] h-[18px]"
      >
        <g clipPath="url(#clip0_7248_46350)">
          <path
            d="M17.2006 8.23156C17.5431 9.91253 17.299 11.6601 16.5089 13.1829C15.7189 14.7057 14.4307 15.9116 12.8592 16.5995C11.2877 17.2875 9.52778 17.4159 7.87303 16.9633C6.21829 16.5108 4.7687 15.5046 3.76601 14.1126C2.76333 12.7206 2.26815 11.027 2.36305 9.3141C2.45796 7.60121 3.13722 5.97263 4.28754 4.69994C5.43787 3.42725 6.98974 2.58738 8.68436 2.3204C10.379 2.05342 12.1139 2.37545 13.5998 3.23281"
            stroke="#36EA36"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.59961 8.98145L9.84961 11.2314L17.3496 3.73145"
            stroke="#36EA36"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_7248_46350">
            <rect
              width="18"
              height="18"
              fill="white"
              transform="translate(0.849609 0.731445)"
            />
          </clipPath>
        </defs>
      </svg>
      <span className="font-sans text-sm max-md:text-xs whitespace-nowrap leading-tight">
        DCA Strategy Applied
      </span>

      <img
        src={chevronRight}
        alt="chevron-right"
        className="w-4.5 h-4.5 max-md:w-[14px] max-md:h-[14px]"
      />
    </div>
  );
};

export default DcaStrategy;
