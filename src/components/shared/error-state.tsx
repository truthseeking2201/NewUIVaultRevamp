import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ErrorType = 'error' | 'warning' | 'info';

interface ErrorStateProps {
  type?: ErrorType;
  title: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  type = 'error',
  title,
  message,
  onRetry,
  className,
  compact = false
}: ErrorStateProps) {
  // Define icon based on error type
  const Icon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-8 w-8 text-orion" />;
      case 'info':
        return <Info className="h-8 w-8 text-nova" />;
      case 'error':
      default:
        return <AlertCircle className="h-8 w-8 text-red-500" />;
    }
  };

  // Define background color based on error type
  const bgColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-orion/10';
      case 'info':
        return 'bg-nova/10';
      case 'error':
      default:
        return 'bg-red-500/10';
    }
  };

  return (
    <Card className={cn(
      "glass-card overflow-hidden border border-white/10",
      compact ? "p-4" : "p-8",
      className
    )}>
      <CardContent className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "p-0" : "p-6"
      )}>
        <div className={cn(
          "rounded-full p-3 mb-4",
          bgColor()
        )}>
          <Icon />
        </div>

        <h3 className={cn(
          "font-medium",
          compact ? "text-base mb-1" : "text-xl mb-2"
        )}>
          {title}
        </h3>

        {message && (
          <p className={cn(
            "text-text-secondary",
            compact ? "text-sm mb-3" : "mb-6"
          )}>
            {message}
          </p>
        )}

        {onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            className="mt-2 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
