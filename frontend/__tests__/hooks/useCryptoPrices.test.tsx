import { renderHook, act } from "@testing-library/react";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("useCryptoPrices", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("initializes with loading state", () => {
    const { result } = renderHook(() => useCryptoPrices());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.prices).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it("updates prices at specified interval", async () => {
    const { result } = renderHook(() => useCryptoPrices(60000));

    // Wait for initial fetch
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.prices).toBeDefined();

    // Fast-forward 60 seconds
    await act(async () => {
      vi.advanceTimersByTime(60000);
    });

    // Verify that prices were updated
    expect(result.current.previousPrices).toBeDefined();
  });

  it("provides trading pairs", () => {
    const { result } = renderHook(() => useCryptoPrices());

    expect(result.current.tradingPairs).toEqual([
      {
        id: "TON/USDT",
        name: "TON/USDT",
        base: "TON",
        quote: "USDT",
      },
      {
        id: "USDT/TON",
        name: "USDT/TON",
        base: "USDT",
        quote: "TON",
      },
    ]);
  });
});
