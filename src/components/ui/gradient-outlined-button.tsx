import OutlinedBorder from "@/assets/icons/outlined-button.svg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import GlareHover from "./glare-hover";

export const GradientOutlinedButton = ({
  children,
  className = "",
  textClassName = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
  onClick?: () => void;
}) => {
  return (
    <div className={cn("relative inline-block w-fit h-fit", className)}>
      <GlareHover
        glareColor="#ffffff"
        glareOpacity={0.3}
        glareAngle={-30}
        glareSize={300}
        transitionDuration={800}
        playOnce={false}
        className="absolute inset-0 z-10"
        width="100%"
        height="100%"
        background="transparent"
      >
        <Button
          className={cn(
            "flex items-center justify-center rounded-lg md:px-4 px-2 md:py-2 py-1 bg-transparent border-none relative z-10",
            textClassName
          )}
          onClick={onClick}
          style={{
            boxShadow: "none",
          }}
        >
          <span
            className={cn("md:text-lg text-[10px] font-bold", textClassName)}
          >
            {children}
          </span>
        </Button>
      </GlareHover>
      <img
        src={OutlinedBorder}
        alt="gradient border"
        className="absolute inset-0 w-full h-full pointer-events-none z-20 rounded-lg"
        draggable={false}
      />
    </div>
  );
};
