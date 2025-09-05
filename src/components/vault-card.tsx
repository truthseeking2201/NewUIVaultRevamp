import React from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp, Shield, Coins } from "lucide-react";
import { Vault } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface VaultCardProps {
  vault: Vault;
  onSelect: (id: string) => void;
}

const getRiskColor = (risk: string): string => {
  switch (risk) {
    case 'Low':
      return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
    case 'Medium':
      return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
    case 'Medium-High':
      return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
    case 'High':
      return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
    default:
      return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
  }
};

export function VaultCard({ vault, onSelect }: VaultCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{vault.name}</h3>
            <p className="text-sm text-muted-foreground">{vault.strategy}</p>
          </div>
          <Badge variant="outline" className={`${getRiskColor(vault.riskLevel)}`}>
            {vault.riskLevel} Risk
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">TVL</span>
            <span className="text-lg font-semibold">{formatCurrency(vault.tvl)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-muted-foreground">APR</span>
            <span className="text-lg font-semibold text-green-500">{vault.apr}%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 mb-4">
          {vault.tokens.map((token) => (
            <Badge key={token} variant="secondary" className="text-xs">
              {token}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-4 gap-2 mb-2">
          <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-md">
            <span className="text-xs text-muted-foreground">24h</span>
            <span className={`text-xs font-medium ${vault.performance.day > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {vault.performance.day > 0 ? '+' : ''}{vault.performance.day}%
            </span>
          </div>
          <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-md">
            <span className="text-xs text-muted-foreground">7d</span>
            <span className={`text-xs font-medium ${vault.performance.week > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {vault.performance.week > 0 ? '+' : ''}{vault.performance.week}%
            </span>
          </div>
          <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-md">
            <span className="text-xs text-muted-foreground">30d</span>
            <span className={`text-xs font-medium ${vault.performance.month > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {vault.performance.month > 0 ? '+' : ''}{vault.performance.month}%
            </span>
          </div>
          <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-md">
            <span className="text-xs text-muted-foreground">All</span>
            <span className={`text-xs font-medium ${vault.performance.allTime > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {vault.performance.allTime > 0 ? '+' : ''}{vault.performance.allTime}%
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Coins className="h-3 w-3" />
            <span>Multi-asset</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Auto-compound</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="group"
          onClick={() => onSelect(vault.id)}
        >
          Details
          <ArrowUpRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
} 