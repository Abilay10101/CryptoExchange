import React from 'react';
import { ChevronDown, DollarSign, Wallet } from 'lucide-react';

export const currencies = ['USD', 'BTC', 'ETH', 'SOL', 'KZT'];
export const fiatCurrencies = ['USD', 'KZT'];
export const cryptoCurrencies = ['BTC', 'ETH', 'SOL'];

export const formatAmount = (amount: number, currency: string) => {
  switch (currency) {
    case 'BTC':
    case 'ETH':
    case 'SOL':
      return amount.toFixed(8);
    case 'USD':
    case 'KZT':
      return amount.toFixed(2);
    default:
      return amount.toString();
  }
};

export const getExchangeRate = (rates: Record<string, number>, fromCurrency: string, toCurrency: string) => {
  const key = `${fromCurrency}-${toCurrency}`;
  return rates[key] || 0;
};

interface CurrencySelectorProps {
  type: 'from' | 'to';
  show: boolean;
  setShow: (show: boolean) => void;
  selected: string;
  currencies: string[];
  otherCurrency: string;
  onSelect: (currency: string) => void;
  isSellPage?: boolean;
}

export function CurrencySelector({
  type,
  show,
  setShow,
  selected,
  currencies,
  otherCurrency,
  onSelect,
  isSellPage = false,
}: CurrencySelectorProps) {
  // For sell page, restrict 'from' currency to crypto only
  const availableCurrencies = isSellPage && type === 'from' 
    ? cryptoCurrencies 
    : isSellPage && type === 'to'
    ? fiatCurrencies
    : currencies;

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center bg-[#171B26] rounded-lg px-3 py-2 text-white"
        disabled={isSellPage && type === 'from'} // Disable button on sell page for 'from' currency
      >
        {selected === 'BTC' || selected === 'ETH' || selected === 'SOL' ? (
          <Wallet className="w-5 h-5 mr-2" />
        ) : (
          <DollarSign className="w-5 h-5 mr-2" />
        )}
        {selected}
        {(!isSellPage || (isSellPage && type === 'to')) && (
          <ChevronDown className="w-4 h-4 ml-2" />
        )}
      </button>

      {show && (!isSellPage || (isSellPage && type === 'to')) && (
        <div className="absolute right-0 mt-2 w-48 bg-[#171B26] rounded-lg shadow-lg z-50">
          {availableCurrencies
            .filter((currency) => currency !== otherCurrency)
            .map((currency) => (
              <button
                key={currency}
                onClick={() => onSelect(currency)}
                className="flex items-center w-full px-4 py-2 text-left text-white hover:bg-[#0B0E15]"
              >
                {currency === 'BTC' || currency === 'ETH' || currency === 'SOL' ? (
                  <Wallet className="w-5 h-5 mr-2" />
                ) : (
                  <DollarSign className="w-5 h-5 mr-2" />
                )}
                {currency}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}