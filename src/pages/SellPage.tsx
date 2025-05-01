import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Clock, CreditCard, Globe, LogOut, Menu, Shield, Star } from 'lucide-react';
import { AuthModal } from '../components/AuthModal';
import { auth } from '../firebase';
import { User } from 'firebase/auth';
import { currencies, formatAmount, getExchangeRate, CurrencySelector } from '../utils/currency';

export function SellPage() {
  const [fromAmount, setFromAmount] = useState('0.023');
  const [toAmount, setToAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('USD');
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFromCurrencies, setShowFromCurrencies] = useState(false);
  const [showToCurrencies, setShowToCurrencies] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const [btcResponse, kztResponse] = await Promise.all([
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTRUB')
        ]);

        const btcData = await btcResponse.json();
        const kztData = await kztResponse.json();

        const btcPrice = parseFloat(btcData.price);
        const kztRate = parseFloat(kztData.price) * 0.89;

        const baseRates = {
          'USD-BTC': 1 / btcPrice,
          'USD-KZT': kztRate,
        };

        const allRates = {
          'USD-BTC': baseRates['USD-BTC'],
          'BTC-USD': btcPrice,
          'USD-KZT': baseRates['USD-KZT'],
          'KZT-USD': 1 / baseRates['USD-KZT'],
          'BTC-KZT': btcPrice * baseRates['USD-KZT'],
          'KZT-BTC': 1 / (btcPrice * baseRates['USD-KZT']),
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

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    const numValue = parseFloat(value) || 0;
    const rate = getExchangeRate(rates, fromCurrency, toCurrency);
    setToAmount(formatAmount(numValue * rate, toCurrency));
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    const numValue = parseFloat(value) || 0;
    const rate = getExchangeRate(rates, toCurrency, fromCurrency);
    setFromAmount(formatAmount(numValue * rate, fromCurrency));
  };

  const handleCurrencySelect = (currency: string, type: 'from' | 'to') => {
    if (type === 'to') {
      setToCurrency(currency);
      setShowToCurrencies(false);
      
      const rate = getExchangeRate(rates, fromCurrency, currency);
      const amount = parseFloat(fromAmount) || 0;
      setToAmount(formatAmount(amount * rate, currency));
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E15]">
      {/* Header */}
      <header className="bg-[#171B26] border-b border-gray-800">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-white text-2xl font-bold">Paybis</Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-300 hover:text-white">Buy Crypto</Link>
              <Link to="/sell" className="text-gray-300 hover:text-white">Sell Crypto</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="hidden md:flex items-center text-gray-300 hover:text-white">
              <Globe className="w-4 h-4 mr-2" />
              EN
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">{user.email}</span>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Sign In
              </button>
            )}
            <button className="md:hidden">
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-8">
            Sell Your Crypto
          </h2>
          
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
                    currencies={currencies}
                    otherCurrency={toCurrency}
                    onSelect={(currency) => handleCurrencySelect(currency, 'from')}
                    isSellPage={true}
                  />
                </div>
                <div className="text-sm text-gray-400">
                  {isLoading ? (
                    <span>Loading rate...</span>
                  ) : (
                    <>1 {fromCurrency} = {formatAmount(getExchangeRate(rates, fromCurrency, toCurrency), toCurrency)} {toCurrency}</>
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
                    currencies={currencies}
                    otherCurrency={fromCurrency}
                    onSelect={(currency) => handleCurrencySelect(currency, 'to')}
                    isSellPage={true}
                  />
                </div>
                <div className="text-sm text-gray-400">
                  {isLoading ? (
                    <span>Loading rate...</span>
                  ) : (
                    <>1 {toCurrency} = {formatAmount(getExchangeRate(rates, toCurrency, fromCurrency), fromCurrency)} {fromCurrency}</>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => !user && setIsAuthModalOpen(true)}
              className="w-full bg-blue-600 text-white rounded-lg py-4 mt-6 text-lg font-semibold hover:bg-blue-700"
            >
              {user ? 'Sell Bitcoin Now' : 'Sign In to Sell Bitcoin'}
            </button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#171B26] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Fast Transactions</h3>
              <p className="text-gray-400">Sell crypto instantly to your bank</p>
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
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#171B26] mt-20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">About</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Buy Bitcoin</Link></li>
                <li><Link to="/sell" className="text-gray-400 hover:text-white">Sell Bitcoin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Paybis. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}