import { BarChart3 } from "lucide-react";
import React from "react";

interface EmptyChartStateProps {
  message?: string;
  className?: string;
}

const EmptyChartState: React.FC<EmptyChartStateProps> = ({ message = "No data found", className }) => (
  <div className={`w-full h-[400px] flex flex-col items-center justify-center gap-3 animate-fade-in-up ${className || ''}`}>
    <BarChart3 className="h-12 w-12 text-white/50 animate-bounce-gentle" />
    <div className="font-bold font-mono text-white">{message}</div>
  </div>
);

export default EmptyChartState; 