import { GradientOutlinedButton } from "@/components/ui/gradient-outlined-button";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import CountUp from "@/components/ui/count-up";

const HeroBannerSimple = () => {
  const { isMobile } = useBreakpoint();
  const handleReadMore = () => {
    window.open(
      "https://docs.nodo.xyz/public/nodo-campaigns/nodo-ai-vault-genesis-yield-campaign-phase-1",
      "_blank"
    );
  };

  return (
    <section className="relative w-full h-[210px] flex items-center overflow-hidden md:rounded-xl md:mb-12 mb-0">
      <img
        src={
          isMobile
            ? "/banners/hero-banner-mobile.png"
            : "/banners/hero-banner.png"
        }
        alt="Genesis Vault Campaign Banner"
        className="absolute inset-0 w-full h-full object-cover  md:rounded-xl z-0"
        width={isMobile ? "auto" : 1720}
        height={isMobile ? 220 : 210}
        loading="eager"
        {...{ fetchpriority: "high" }}
      />
      <div className="relative z-20 flex flex-col gap-2 md:gap-4 justify-center h-full text-left md:w-[1000px] w-full">
        <div className="bg-clip-text text-transparent bg-[linear-gradient(90deg,_#FFE8C9_0%,_#F9F4E9_25%,_#E3F6FF_60%,_#C9D4FF_100%)] text-left md:text-[28px] text-base font-bold md:px-12 px-4 md:py-1">
          Claim your share in {isMobile && <br />} NODO’s Genesis vault campaign
        </div>
        <div
          className="text-white font-dm-sans text-[28px] font-bold leading-[36px] tracking-[-0.9px] flex md:flex-row flex-col items-center py-2 md:w-fit w-full md:px-10 px-4 "
          style={{
            background: isMobile
              ? "none"
              : "linear-gradient(90deg, rgba(255, 0, 166, 0.00) 0%, rgba(255, 0, 200, 0.60) 12%, rgba(255, 0, 255, 0.60) 25%, rgba(196, 0, 255, 0.60) 38%, rgba(74, 40, 255, 0.60) 50%, rgba(0, 47, 255, 0.60) 62%, rgba(0, 120, 255, 0.60) 75%, rgba(0, 196, 255, 0.60) 88%, rgba(0, 255, 255, 0.00) 100%)",
          }}
        >
          <div className="flex items-center justify-start w-full md:w-fit">
            <img
              src="/coins/usdc.png"
              alt="USDC"
              className="md:h-8 h-4 w-auto md:ml-2"
              width={isMobile ? 16 : 32}
              height={isMobile ? 16 : 32}
            />
            <div className="ml-2 mr-4 flex gap-2 items-center md:text-[32px] text-base  ">
              <div className="md:w-[105px] w-[45px]">
                <CountUp
                  from={9100}
                  to={10000}
                  duration={3}
                  delay={0}
                  separator=","
                />
              </div>{" "}
              USDC
            </div>
          </div>
          {!isMobile && (
            <span className="mr-4 md:text-[32px] text-base">+ </span>
          )}
          <div className="flex items-center gap-2 justify-start w-full md:w-fit">
            <img
              src="/coins/xp.png"
              alt="XP"
              className="md:h-8 h-4 w-auto"
              width={isMobile ? 16 : 32}
              height={isMobile ? 16 : 32}
            />
            <div className="flex gap-2 items-center md:text-[32px] text-base ">
              <div className="md:w-[230px] w-[105px]">
                <CountUp
                  from={1999999000}
                  to={2000000000}
                  duration={3}
                  delay={0}
                  separator=","
                />
              </div>{" "}
              XP Shares
            </div>
          </div>
        </div>
        <div className="w-fit md:px-12 px-4">
          <GradientOutlinedButton onClick={handleReadMore}>
            <span className="bg-gradient-to-r from-[#FFE8C9] via-[#E3F6FF] to-[#C9D4FF] text-transparent bg-clip-text flex items-center">
              Read More
              <svg
                className="inline ml-2 w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="arrow-gradient"
                    x1="0"
                    y1="12"
                    x2="24"
                    y2="12"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFE8C9" />
                    <stop offset="0.25" stopColor="#F9F4E9" />
                    <stop offset="0.6" stopColor="#E3F6FF" />
                    <stop offset="1" stopColor="#C9D4FF" />
                  </linearGradient>
                </defs>
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="url(#arrow-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </GradientOutlinedButton>
        </div>
      </div>
    </section>
  );
};

export default HeroBannerSimple;
