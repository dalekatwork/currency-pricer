import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PriceCard } from "@/components/crypto/PriceCard";
import { PriceGrid } from "@/components/crypto/PriceGrid";

describe("Crypto Tracker Components", () => {
  describe("PriceCard", () => {
    const mockPriceInfo = {
      price: 2.45,
      change24h: 0.05,
      changePercentage24h: 2.08,
      fromSymbol: "TON",
      toSymbol: "USDT",
      lastUpdated: new Date().toISOString(),
    };

    it("displays price information correctly", () => {
      render(<PriceCard pair="TON/USDT" priceInfo={mockPriceInfo} />);

      expect(screen.getByText("TON/USDT")).toBeInTheDocument();
      expect(screen.getByText("2.450000")).toBeInTheDocument();
      const percentageElements = screen.getAllByText(/2.08/);
      expect(percentageElements.length).toBeGreaterThan(0);
    });

    it("shows coming soon state", () => {
      render(<PriceCard pair="BTC/USDT" comingSoon={true} />);

      expect(screen.getByText("Coming Soon")).toBeInTheDocument();
      expect(
        screen.getByText("Trading pair will be available soon"),
      ).toBeInTheDocument();
    });

    it("shows loading state", () => {
      render(<PriceCard pair="TON/USDT" />);
      const loadingElements = screen.getAllByText("Loading...");
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe("PriceGrid", () => {
    const mockProps = {
      prices: {
        "TON/USDT": {
          price: 2.45,
          change24h: 0.05,
          changePercentage24h: 2.08,
          fromSymbol: "TON",
          toSymbol: "USDT",
          lastUpdated: new Date().toISOString(),
        },
      },
      isLoading: false,
      error: null,
      lastUpdated: new Date().toISOString(),
      tradingPairs: [
        {
          id: "ton-usdt",
          fromCoin: { id: "ton", symbol: "TON", name: "Toncoin" },
          toCoin: { id: "usdt", symbol: "USDT", name: "Tether" },
          active: true,
          addedAt: new Date().toISOString(),
        },
      ],
      onRetry: vi.fn(),
    };

    it("renders price cards for each trading pair", () => {
      render(<PriceGrid {...mockProps} />);
      expect(screen.getByText("TON/USDT")).toBeInTheDocument();
    });

    it("shows loading state", () => {
      render(<PriceGrid {...mockProps} isLoading={true} />);
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("shows error state", () => {
      render(<PriceGrid {...mockProps} error="Failed to fetch data" />);
      expect(screen.getByText("Failed to fetch data")).toBeInTheDocument();
    });
  });
});
