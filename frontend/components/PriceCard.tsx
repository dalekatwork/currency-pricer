"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceCardProps {
  pair: string;
  price: number;
  previousPrice?: number;
}

export function PriceCard({ pair, price, previousPrice }: PriceCardProps) {
  const priceChange = previousPrice ? price - previousPrice : 0;
  const priceChangePercent = previousPrice ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = priceChange >= 0;
  
  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/50 bg-gradient-to-br from-card to-card/95">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {pair}
        </CardTitle>
        <Badge 
          variant={isPositive ? "default" : "destructive"} 
          className={`ml-2 animate-fade-in ${
            isPositive 
              ? "bg-success hover:bg-success/90" 
              : "bg-destructive hover:bg-destructive/90"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          {Math.abs(priceChangePercent).toFixed(2)}%
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold tracking-tight">
          {price.toFixed(6)}
        </div>
        <p className={`text-sm mt-2 ${
          isPositive ? "text-success" : "text-destructive"
        }`}>
          {isPositive ? "↗" : "↘"} {Math.abs(priceChange).toFixed(6)} ({priceChangePercent > 0 ? "+" : ""}
          {priceChangePercent.toFixed(2)}%)
        </p>
      </CardContent>
    </Card>
  );
}