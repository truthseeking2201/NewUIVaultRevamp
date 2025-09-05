import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowRight, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AICardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
  gradient?: "nova" | "orion" | "emerald" | "violet" | "none";
  glowEffect?: boolean;
  hoverEffect?: boolean;
  clickable?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  aiEnhanced?: boolean;
  aiTag?: string;
  borderIndicator?: boolean;
  loading?: boolean;
}

export function AICard({
  children,
  className,
  title,
  subtitle,
  icon,
  footer,
  headerAction,
  gradient = "none",
  glowEffect = false,
  hoverEffect = true,
  clickable = false,
  collapsible = false,
  defaultCollapsed = false,
  aiEnhanced = false,
  aiTag,
  borderIndicator = false,
  loading = false,
  ...props
}: AICardProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isHovered, setIsHovered] = useState(false);

  // Functions to handle hover state
  const handleMouseEnter = () => {
    if (hoverEffect) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Generate gradient styles based on the gradient prop
  const getGradientClass = () => {
    switch (gradient) {
      case "nova":
        return "bg-gradient-to-br from-black/60 via-black/80 to-black/60 border-l-nova";
      case "orion":
        return "bg-gradient-to-br from-black/60 via-black/80 to-black/60 border-l-orion";
      case "emerald":
        return "bg-gradient-to-br from-black/60 via-black/80 to-black/60 border-l-emerald";
      case "violet":
        return "bg-gradient-to-br from-black/60 via-black/80 to-black/60 border-l-violet";
      default:
        return "bg-black/30";
    }
  };

  // Generate glow effect styles based on the gradient and glowEffect props
  const getGlowClass = () => {
    if (!glowEffect) return "";

    switch (gradient) {
      case "nova":
        return "shadow-[0_0_15px_rgba(249,115,22,0.15)]";
      case "orion":
        return "shadow-[0_0_15px_rgba(245,158,11,0.15)]";
      case "emerald":
        return "shadow-[0_0_15px_rgba(16,185,129,0.15)]";
      case "violet":
        return "shadow-[0_0_15px_rgba(62,22,114,0.15)]";
      default:
        return "";
    }
  };

  // Get border style for left indicator
  const getBorderStyle = () => {
    if (!borderIndicator) return "";

    return "border-l-2";
  };

  // Get cursor style for clickable cards
  const getCursorStyle = () => {
    if (clickable) return "cursor-pointer";
    if (collapsible) return "cursor-pointer";
    return "";
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-xl border border-white/10 backdrop-blur-sm overflow-hidden transition-all duration-300",
        getGradientClass(),
        getGlowClass(),
        getBorderStyle(),
        getCursorStyle(),
        (isHovered && hoverEffect) ? "translate-y-[-2px]" : "",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        boxShadow: isHovered && glowEffect ? getGlowClass() : "none",
      }}
      {...props}
    >
      {/* Neural noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />

      {/* Background gradient orb effect */}
      {gradient !== "none" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute -top-1/2 -right-1/4 w-2/3 h-2/3 rounded-full opacity-10 blur-3xl ${
              gradient === "nova"
                ? "bg-nova"
                : gradient === "orion"
                ? "bg-orion"
                : gradient === "emerald"
                ? "bg-emerald"
                : "bg-violet"
            }`}
          />
        </div>
      )}

      {/* AI Tag */}
      {aiEnhanced && (
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-nova/10 border border-nova/20 text-[10px] text-nova/90">
            <Brain size={10} />
            <span>{aiTag || "AI Enhanced"}</span>
            <motion.div
              className="w-1 h-1 rounded-full bg-nova/90 ml-0.5"
              animate={{
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="relative z-10">
        {/* Header */}
        {(title || icon || headerAction) && (
          <div
            className={`flex items-center justify-between p-4 border-b border-white/5 ${
              collapsible ? "cursor-pointer" : ""
            }`}
            onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
          >
            <div className="flex items-center gap-3">
              {icon && (
                <div className={`rounded-lg p-2 ${
                  gradient === "nova" ? "bg-nova/10" :
                  gradient === "orion" ? "bg-orion/10" :
                  gradient === "emerald" ? "bg-emerald/10" :
                  gradient === "violet" ? "bg-violet/10" :
                  "bg-white/10"
                }`}>
                  {icon}
                </div>
              )}
              <div>
                {title && <h3 className="text-white font-medium text-base">{title}</h3>}
                {subtitle && <p className="text-white/60 text-xs">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {headerAction && <div>{headerAction}</div>}
              {collapsible && (
                <div>
                  {collapsed ? (
                    <ChevronDown size={16} className="text-white/60" />
                  ) : (
                    <ChevronUp size={16} className="text-white/60" />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={collapsible ? { height: 0, opacity: 0 } : false}
              animate={collapsible ? { height: "auto", opacity: 1 } : {}}
              exit={collapsible ? { height: 0, opacity: 0 } : {}}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className={`p-4 ${title || icon ? "" : "pt-4"}`}>{children}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            {footer}
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center">
            <motion.div
              className="mx-auto mb-3 relative w-10 h-10"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full border-2 border-t-nova border-r-transparent border-b-transparent border-l-transparent" />
            </motion.div>
            <div className="text-sm text-white/70">Processing...</div>
          </div>
        </div>
      )}

      {/* Hover Indicator for Clickable Cards */}
      {clickable && (
        <motion.div
          className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-black/30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowRight size={12} className="text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}

export function AICardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function AICardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-semibold leading-none tracking-tight text-white",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function AICardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-white/60", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function AICardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function AICardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-4 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function AICardInsightBadge({
  children,
  type = "info",
  icon,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  type?: "info" | "success" | "warning" | "alert";
  icon?: React.ReactNode;
}) {
  // Generate background color based on type
  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-emerald/10 text-emerald border-emerald/20";
      case "warning":
        return "bg-orion/10 text-orion border-orion/20";
      case "alert":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-nova/10 text-nova border-nova/20";
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case "success":
        return <Sparkles size={12} />;
      case "warning":
        return <Brain size={12} />;
      case "alert":
        return <Brain size={12} />;
      default:
        return <Brain size={12} />;
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border",
        getBgColor(),
        className
      )}
      {...props}
    >
      {icon || getDefaultIcon()}
      <span>{children}</span>
    </div>
  );
}
