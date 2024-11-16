import { render, screen } from '@testing-library/react';
import { PriceCard } from '@/components/crypto/PriceCard';
import { describe, it, expect } from 'vitest';

describe('PriceCard', () => {
  it('displays price information correctly', () => {
    const props = {
      pair: 'TON/USDT',
      price: 2.45,
      previousPrice: 2.40,
    };

    render(<PriceCard {...props} />);

    // Check if trading pair is displayed
    expect(screen.getByText('TON/USDT')).toBeInTheDocument();

    // Check if current price is displayed
    expect(screen.getByText('2.450000')).toBeInTheDocument();

    // Check if price change percentage is displayed (should be positive)
    const percentageChange = ((2.45 - 2.40) / 2.40 * 100).toFixed(2);
    expect(screen.getByText(`${percentageChange}%`)).toBeInTheDocument();
  });

  it('shows correct color coding for price decrease', () => {
    const props = {
      pair: 'TON/USDT',
      price: 2.35,
      previousPrice: 2.40,
    };

    const { container } = render(<PriceCard {...props} />);
    
    // Check for the presence of destructive class indicating price decrease
    const priceChangeElement = container.querySelector('.text-destructive');
    expect(priceChangeElement).toBeInTheDocument();
  });
});