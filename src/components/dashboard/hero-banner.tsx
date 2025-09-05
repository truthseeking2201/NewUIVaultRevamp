import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroBannerImage1 from "@/assets/images/dashboard/hero-banner-1.png";
import HeroBannerImage2 from "@/assets/images/dashboard/hero-banner-2.png";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { GradientOutlinedButton } from "@/components/ui/gradient-outlined-button";
import { useWallet } from "@/hooks/use-wallet";

type Slide = {
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  image: string;
  content?: React.ReactNode;
};

const ConnectWalletButton = () => {
  const { openConnectWalletDialog } = useWallet();
  return (
    <GradientOutlinedButton onClick={openConnectWalletDialog}>
      <span className="bg-gradient-to-r from-[#FFE8C9] via-[#E3F6FF] to-[#C9D4FF] text-transparent bg-clip-text flex items-center">
        Connect Wallet
      </span>
    </GradientOutlinedButton>
  );
};

const slides: Slide[] = [
  {
    title: (
      <div className="bg-clip-text text-transparent bg-[linear-gradient(90deg,_#FFE8C9_0%,_#F9F4E9_25%,_#E3F6FF_60%,_#C9D4FF_100%)] text-center font-dm-sans text-[32px] font-bold">
        NODO AI Vaults Are Live!
      </div>
    ),
    description: (
      <div className="text-white text-sm">
        Connect your wallet now to unlock XP Shares Airdrops
      </div>
    ),
    image: HeroBannerImage1,
    content: (
      <div className="mt-6 w-fit">
        <ConnectWalletButton />
      </div>
    ),
  },
  {
    title: (
      <div className="bg-clip-text text-transparent bg-[linear-gradient(90deg,_#FFE8C9_0%,_#F9F4E9_25%,_#E3F6FF_60%,_#C9D4FF_100%)] text-center font-dm-sans text-[32px] font-bold">
        Claim your share in NODO’s Genesis vault campaign
      </div>
    ),
    description: (
      <div
        className="text-white text-center font-dm-sans text-[32px] font-bold leading-[36.258px] tracking-[-0.906px] flex items-center justify-center py-1 w-fit px-10 ml-[-40px]"
        style={{
          background:
            "linear-gradient(90deg, rgba(255, 0, 166, 0.00) 0%, rgba(255, 0, 200, 0.60) 12%, rgba(255, 0, 255, 0.60) 25%, rgba(196, 0, 255, 0.60) 38%, rgba(74, 40, 255, 0.60) 50%, rgba(0, 47, 255, 0.60) 62%, rgba(0, 120, 255, 0.60) 75%, rgba(0, 196, 255, 0.60) 88%, rgba(0, 255, 255, 0.00) 100%)",
        }}
      >
        <img
          src="/coins/usdc.png"
          alt="USDC"
          className="h-8 w-auto"
          width="32"
          height="32"
        />
        <span className="ml-2 mr-4">10,000 USDC </span>
        <span className="mr-4">+ </span>
        <img
          src="/coins/xp.png"
          alt="XP"
          className="h-8 w-auto"
          width="32"
          height="32"
        />
        <span className="ml-2">1,500,000,000 XP</span>
      </div>
    ),
    image: HeroBannerImage2,
    content: (
      <div className="mt-6 w-fit">
        <GradientOutlinedButton
          onClick={() => (window.location.href = "/vaults")}
        >
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
    ),
  },
];

const HeroBanner = React.memo(() => {
  const [active, setActive] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearTimeout(timer);
  }, [active]);

  const handlePrev = () =>
    setActive((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const handleNext = () =>
    setActive((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const { left, right } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const edgeThreshold = 80; // px from edge
    setShowLeftArrow(x - left < edgeThreshold);
    setShowRightArrow(right - x < edgeThreshold);
  };
  const handleMouseLeave = () => {
    setShowLeftArrow(false);
    setShowRightArrow(false);
  };

  return (
    <section
      className="relative w-full h-[210px] md:h-[210px] flex items-center overflow-hidden rounded-xl mb-12"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Optimized banner image */}
      <img
        src={slides[active].image}
        alt={
          active === 0
            ? "NODO AI Vaults Banner"
            : "Genesis Vault Campaign Banner"
        }
        className="absolute inset-0 w-full h-full object-cover rounded-xl z-0"
        width={1720}
        height={210}
        loading="eager"
        {...{ fetchpriority: "high" }}
      />
      <div className="relative z-20 flex flex-col justify-center h-full text-left max-w-[1000px] px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col"
          >
            {slides[active].title}
            {slides[active].description}
            {slides[active].content}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Carousel navigation dots with animation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {slides.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => setActive(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            initial={false}
            animate={{
              width: active === idx ? 32 : 16,
              opacity: active === idx ? 1 : 0.5,
              backgroundColor: active === idx ? "#fff" : "#b6a6e7",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              height: 8,
              borderRadius: 4,
              border: "none",
              outline: "none",
              cursor: "pointer",
              boxShadow: active === idx ? "0 0 8px #fff" : "none",
            }}
            className="focus:outline-none"
          />
        ))}
      </div>
      {/* Arrow navigation, only show when mouse near edge */}
      {showLeftArrow && (
        <Button
          variant="ai-outline"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 rounded-full w-8 h-8 flex items-center justify-center p-0 pointer-events-auto bg-transparent shadow-none border-none"
          onClick={handlePrev}
          aria-label="Previous slide"
          style={{ background: "none", boxShadow: "none", border: "none" }}
        >
          <ArrowLeft className="text-white w-6 h-6" />
        </Button>
      )}
      {showRightArrow && (
        <Button
          variant="ai-outline"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 rounded-full w-8 h-8 flex items-center justify-center p-0 pointer-events-auto bg-transparent shadow-none border-none"
          onClick={handleNext}
          aria-label="Next slide"
          style={{ background: "none", boxShadow: "none", border: "none" }}
        >
          <ArrowRight className="text-white w-6 h-6" />
        </Button>
      )}
    </section>
  );
});

export default HeroBanner;
