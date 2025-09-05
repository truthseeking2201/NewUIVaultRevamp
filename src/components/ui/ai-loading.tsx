import React from "react";
import { motion } from "framer-motion";
import { Brain, Loader2, Sparkles, Zap, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface AILoadingProps {
  type?: "neural" | "pulse" | "grid" | "processing" | "glow";
  size?: "sm" | "md" | "lg" | "full";
  theme?: "nova" | "orion" | "emerald" | "violet";
  message?: string;
  className?: string;
  fullPage?: boolean;
  showIcon?: boolean;
  withBackground?: boolean;
}

export function AILoading({
  type = "neural",
  size = "md",
  theme = "nova",
  message = "Loading...",
  className,
  fullPage = false,
  showIcon = true,
  withBackground = false,
}: AILoadingProps) {
  // Determine main color based on theme
  const getThemeColor = () => {
    switch (theme) {
      case "nova":
        return "#F97316"; // orange
      case "orion":
        return "#F59E0B"; // amber
      case "emerald":
        return "#10B981"; // emerald
      case "violet":
        return "#3E1672"; // violet
      default:
        return "#F97316"; // default orange
    }
  };

  // Calculate size dimensions
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "w-8 h-8";
      case "md":
        return "w-12 h-12";
      case "lg":
        return "w-20 h-20";
      case "full":
        return "w-full h-full";
      default:
        return "w-12 h-12";
    }
  };

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case "neural":
        return <Brain size={size === "lg" ? 28 : size === "md" ? 20 : 16} />;
      case "pulse":
        return <Zap size={size === "lg" ? 28 : size === "md" ? 20 : 16} />;
      case "grid":
        return <Cpu size={size === "lg" ? 28 : size === "md" ? 20 : 16} />;
      case "processing":
      case "glow":
        return <Sparkles size={size === "lg" ? 28 : size === "md" ? 20 : 16} />;
      default:
        return <Brain size={size === "lg" ? 28 : size === "md" ? 20 : 16} />;
    }
  };

  // Container styles
  const containerClasses = cn(
    "flex items-center justify-center",
    fullPage ? "fixed inset-0 z-50" : "relative",
    withBackground ? "bg-black/50 backdrop-blur-sm" : "",
    className
  );

  // Render different loading animations based on type
  const renderLoadingAnimation = () => {
    const color = getThemeColor();
    const sizeClasses = getSizeClass();

    switch (type) {
      case "neural":
        return (
          <motion.div className={`relative ${sizeClasses}`}>
            {/* Neural network nodes and connections */}
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />

            {/* Orbital rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-t-transparent border-b-transparent"
              style={{ borderLeftColor: color, borderRightColor: color }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            <motion.div
              className="absolute inset-0 rounded-full border-2 border-l-transparent border-r-transparent"
              style={{ borderTopColor: color, borderBottomColor: color, rotateX: "65deg" }}
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />

            {/* Pulsing center */}
            {showIcon && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-white/90"
                animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {getIcon()}
              </motion.div>
            )}
          </motion.div>
        );

      case "pulse":
        return (
          <div className={`relative ${sizeClasses}`}>
            {/* Pulsing circles */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${color}` }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${color}` }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 0.3, 0.6],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />

            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${color}` }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />

            {/* Center dot */}
            <motion.div
              className="absolute inset-0 m-auto rounded-full"
              style={{
                backgroundColor: color,
                width: size === "lg" ? "30%" : size === "md" ? "35%" : "40%",
                height: size === "lg" ? "30%" : size === "md" ? "35%" : "40%",
              }}
              animate={{
                scale: [1, 0.8, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {showIcon && (
                <div className="h-full w-full flex items-center justify-center text-white">
                  {getIcon()}
                </div>
              )}
            </motion.div>
          </div>
        );

      case "grid":
        // Create a grid of dots that light up in sequence
        return (
          <div className={`relative ${sizeClasses}`}>
            <div className="grid grid-cols-3 grid-rows-3 gap-1 h-full w-full">
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="rounded-sm"
                  style={{ backgroundColor: color }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {showIcon && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-white/90"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {getIcon()}
              </motion.div>
            )}
          </div>
        );

      case "processing":
        return (
          <div className={`relative ${sizeClasses}`}>
            {/* Spinning border */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/10"
              style={{ borderTopColor: color }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />

            {/* Processing lines */}
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1/2 h-1 rounded-full mb-1"
                  style={{ backgroundColor: color, opacity: 0.2 }}
                  animate={{
                    width: ["30%", "70%", "30%"],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {showIcon && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-white/90"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {getIcon()}
              </motion.div>
            )}
          </div>
        );

      case "glow":
        return (
          <motion.div
            className={`relative ${sizeClasses} flex items-center justify-center`}
            animate={{
              boxShadow: [
                `0 0 10px 0 ${color}30`,
                `0 0 20px 5px ${color}50`,
                `0 0 10px 0 ${color}30`
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Glowing orb */}
            <motion.div
              className="w-2/3 h-2/3 rounded-full"
              style={{ backgroundColor: color }}
              animate={{
                scale: [0.8, 1, 0.8],
                opacity: [0.6, 0.8, 0.6]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {showIcon && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-white"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {getIcon()}
              </motion.div>
            )}
          </motion.div>
        );

      default:
        return (
          <motion.div
            className={`rounded-full border-2 border-white/10 ${sizeClasses}`}
            style={{ borderTopColor: color }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        );
    }
  };

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        {renderLoadingAnimation()}

        {message && (
          <motion.div
            className="text-white/80 text-sm font-medium mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {message}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function AILoadingFallback() {
  return (
    <div className="w-full h-full min-h-[100px] flex items-center justify-center">
      <Loader2 className="h-6 w-6 text-white/60 animate-spin" />
    </div>
  );
}
