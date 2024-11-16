"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { PriceInfo } from "@/types/crypto";

interface PriceCardProps {
  pair: string;
  priceInfo?: PriceInfo;
  comingSoon?: boolean;
}

export function PriceCard({
  pair,
  priceInfo,
  comingSoon = false,
}: PriceCardProps) {
  if (comingSoon) {
    return (
      <Card className="w-full max-w-md hover:shadow-lg transition-all duration-300 border-2 border-muted bg-gradient-to-br from-card to-card/95 opacity-75">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-muted-foreground">
            {pair}
          </CardTitle>
          <Badge variant="secondary" className="ml-2">
            <Clock className="w-4 h-4 mr-1" />
            Coming Soon
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold tracking-tight text-muted-foreground">
            ---.------
          </div>
          <p className="text-sm mt-2 text-muted-foreground">
            Trading pair will be available soon
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!priceInfo) {
    return (
      <Card className="w-full max-w-md hover:shadow-lg transition-all duration-300 border-2 border-muted bg-gradient-to-br from-card to-card/95">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-muted-foreground">
            {pair}
          </CardTitle>
          <Badge variant="secondary" className="ml-2">
            Loading...
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold tracking-tight text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = priceInfo.changePercentage24h >= 0;

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/50 bg-gradient-to-br from-card to-card/95">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {pair}
        </CardTitle>
        <Badge
          variant={isPositive ? "default" : "destructive"}
          className={`ml-2 ${
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
          {Math.abs(priceInfo.changePercentage24h).toFixed(2)}%
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold tracking-tight">
          {priceInfo.price.toFixed(6)}
        </div>
        <p
          className={`text-sm mt-2 ${
            isPositive ? "text-success" : "text-destructive"
          }`}
        >
          {isPositive ? "↗" : "↘"} {Math.abs(priceInfo.change24h).toFixed(6)}{" "}
          ({priceInfo.changePercentage24h > 0 ? "+" : ""}
          {priceInfo.changePercentage24h.toFixed(2)}%) 24h
        </p>
      </CardContent>
    </Card>
  );
}
