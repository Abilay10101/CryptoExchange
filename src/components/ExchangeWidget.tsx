import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, CreditCard, DollarSign, Shield, Clock, Star, Wallet } from 'lucide-react';
import { auth } from '../firebase';
import { User } from 'firebase/auth';

type Currency = {
  symbol: string;
  name: string;
  icon: React.ReactNode;
};

const currencies: Record<string, Currency> = {
  USD: {
    symbol: 'USD',
    name: 'US Dollar',
    icon: <DollarSign className="w-5 h-5" />,
  },
  KZT: {
    symbol: 'KZT',
    name: 'Tenge',
    icon: <span className="text-lg">₸</span>,
  },
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: <Wallet className="w-5 h-5" />,
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: <Wallet className="w-5 h-5" />,
  },
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    icon: <Wallet className="w-5 h-5" />,
  },
};

export function ExchangeWidget() {
  const [fromAmount, setFromAmount] = useState('1000');
  const [toAmount, setToAmount] = useState('0.023');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BTC');
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showFromCurrencies, setShowFromCurrencies] = useState(false);
  const [showToCurrencies, setShowToCurrencies] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const [btcResponse, kztResponse, ethResponse, solResponse] = await Promise.all([
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTRUB'),
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'),
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT')
        ]);

        const btcData = await btcResponse.json();
        const kztData = await kztResponse.json();
        const ethData = await ethResponse.json();
        const solData = await solResponse.json();

        const btcPrice = parseFloat(btcData.price);
        const kztRate = parseFloat(kztData.price) * 0.89;
        const ethPrice = parseFloat(ethData.price);
        const solPrice = parseFloat(solData.price);

        const baseRates = {
          'USD-BTC': 1 / btcPrice,
          'USD-KZT': kztRate,
          'USD-ETH': 1 / ethPrice,
          'USD-SOL': 1 / solPrice,
        };

        const allRates = {
          'USD-BTC': baseRates['USD-BTC'],
          'BTC-USD': btcPrice,
          'USD-KZT': baseRates['USD-KZT'],
          'KZT-USD': 1 / baseRates['USD-KZT'],
          'BTC-KZT': btcPrice * baseRates['USD-KZT'],
          'KZT-BTC': 1 / (btcPrice * baseRates['USD-KZT']),
          'USD-ETH': baseRates['USD-ETH'],
          'ETH-USD': ethPrice,
          'USD-SOL': baseRates['USD-SOL'],
          'SOL-USD': solPrice,
          'ETH-BTC': ethPrice / btcPrice,
          'BTC-ETH': btcPrice / ethPrice,
          'SOL-BTC': solPrice / btcPrice,
          'BTC-SOL': btcPrice / solPrice,
          'ETH-SOL': ethPrice / solPrice,
          'SOL-ETH': solPrice / ethPrice,
          'ETH-KZT': ethPrice * baseRates['USD-KZT'],
          'KZT-ETH': 1 / (ethPrice * baseRates['USD-KZT']),
          'SOL-KZT': solPrice * baseRates['USD-KZT'],
          'KZT-SOL': 1 / (solPrice * baseRates['USD-KZT']),
        };

        setRates(allRates);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        setIsLoading(false);
      }
    };

    fetchExchangeRates();
    const interval = setInterval(fetchExchangeRates, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'BTC') {
      return amount.toFixed(8);
    }
    return amount.toFixed(2);
  };

  const getExchangeRate = (from: string, to: string) => {
    const rate = rates[`${from}-${to}`];
    if (rate) return rate;
    
    const inverseRate = rates[`${to}-${from}`];
    if (inverseRate) return 1 / inverseRate;
    
    return 0;
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    const numValue = parseFloat(value) || 0;
    const rate = getExchangeRate(fromCurrency, toCurrency);
    setToAmount(formatAmount(numValue * rate, toCurrency));
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    const numValue = parseFloat(value) || 0;
    const rate = getExchangeRate(toCurrency, fromCurrency);
    setFromAmount(formatAmount(numValue * rate, fromCurrency));
  };

  const handleCurrencySelect = (currency: string, type: 'from' | 'to') => {
    if (type === 'from') {
      if (currency === toCurrency) {
        setToCurrency(fromCurrency);
      }
      setFromCurrency(currency);
      setShowFromCurrencies(false);
    } else {
      if (currency === fromCurrency) {
        setFromCurrency(toCurrency);
      }
      setToCurrency(currency);
      setShowToCurrencies(false);
    }

    const newFromCurrency = type === 'from' ? currency : fromCurrency;
    const newToCurrency = type === 'to' ? currency : toCurrency;
    const rate = getExchangeRate(newFromCurrency, newToCurrency);
    const amount = parseFloat(fromAmount) || 0;
    setToAmount(formatAmount(amount * rate, newToCurrency));
  };

  const CurrencySelector = ({ type, show, setShow, selected }: { 
    type: 'from' | 'to', 
    show: boolean, 
    setShow: (show: boolean) => void,
    selected: string 
  }) => (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center bg-[#171B26] rounded-lg px-3 py-2 text-white hover:bg-[#1f2937]"
      >
        {currencies[selected].icon}
        <span className="mx-2">{selected}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {show && (
        <div className="absolute right-0 mt-2 w-48 bg-[#171B26] rounded-lg shadow-xl z-10">
          {Object.entries(currencies)
            .filter(([symbol]) => type === 'from' ? symbol !== toCurrency : symbol !== fromCurrency)
            .map(([symbol, currency]) => (
              <button
                key={symbol}
                onClick={() => handleCurrencySelect(symbol, type)}
                className="flex items-center w-full px-4 py-2 text-white hover:bg-[#1f2937] first:rounded-t-lg last:rounded-b-lg"
              >
                {currency.icon}
                <span className="ml-2">{currency.name}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Exchange Widget */}
      <div className="bg-[#171B26] rounded-2xl p-6 mb-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* From Currency */}
          <div className="space-y-2">
            <label className="text-gray-400">You Send</label>
            <div className="bg-[#0B0E15] rounded-lg p-4 flex items-center">
              <input
                type="text"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                className="bg-transparent text-white text-2xl w-full focus:outline-none"
                placeholder="0.00"
              />
              <CurrencySelector
                type="from"
                show={showFromCurrencies}
                setShow={setShowFromCurrencies}
                selected={fromCurrency}
              />
            </div>
            <div className="text-sm text-gray-400">
              {isLoading ? (
                <span>Loading rate...</span>
              ) : (
                <>1 {fromCurrency} = {formatAmount(getExchangeRate(fromCurrency, toCurrency), toCurrency)} {toCurrency}</>
              )}
            </div>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <label className="text-gray-400">You Get</label>
            <div className="bg-[#0B0E15] rounded-lg p-4 flex items-center">
              <input
                type="text"
                value={toAmount}
                onChange={(e) => handleToAmountChange(e.target.value)}
                className="bg-transparent text-white text-2xl w-full focus:outline-none"
                placeholder="0.00"
              />
              <CurrencySelector
                type="to"
                show={showToCurrencies}
                setShow={setShowToCurrencies}
                selected={toCurrency}
              />
            </div>
            <div className="text-sm text-gray-400">
              {isLoading ? (
                <span>Loading rate...</span>
              ) : (
                <>1 {toCurrency} = {formatAmount(getExchangeRate(toCurrency, fromCurrency), fromCurrency)} {fromCurrency}</>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={() => !user && navigate('/login')}
          className="w-full bg-blue-600 text-white rounded-lg py-4 mt-6 text-lg font-semibold hover:bg-blue-700"
        >
          {user ? 'Buy Bitcoin Now' : 'Sign In to Buy Bitcoin'}
        </button>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-[#171B26] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Fast Purchases</h3>
          <p className="text-gray-400">Buy crypto instantly with credit card</p>
        </div>
        <div className="text-center">
          <div className="bg-[#171B26] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Secure Platform</h3>
          <p className="text-gray-400">Licensed and regulated exchange</p>
        </div>
        <div className="text-center">
          <div className="bg-[#171B26] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">24/7 Support</h3>
          <p className="text-gray-400">Live chat support anytime</p>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-16 text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Star className="w-6 h-6 text-yellow-400" />
          <Star className="w-6 h-6 text-yellow-400" />
          <Star className="w-6 h-6 text-yellow-400" />
          <Star className="w-6 h-6 text-yellow-400" />
          <Star className="w-6 h-6 text-yellow-400" />
        </div>
        <p className="text-white text-lg">Trusted by over 1 million customers worldwide</p>
      </div>
    </>
  );
}