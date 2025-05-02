import React, { useState, useEffect } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { Wallet, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const injected = new InjectedConnector({
  supportedChainIds: [1, 56, 137] // Ethereum, BSC, Polygon
});

const walletconnect = new WalletConnectConnector({
  rpc: {
    1: 'https://mainnet.infura.io/v3/your-infura-id',
    56: 'https://bsc-dataseed.binance.org',
    137: 'https://polygon-rpc.com'
  },
  qrcode: true,
  pollingInterval: 12000
});

interface WalletConnectProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnect({ isOpen, onClose }: WalletConnectProps) {
  const { activate, active, account, deactivate, error } = useWeb3React<Web3Provider>();
  const [connecting, setConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  useEffect(() => {
    if (active && connecting) {
      setConnecting(false);
      setTimeout(onClose, 1500); // Close after showing success state
    }
  }, [active, connecting, onClose]);

  const connectWallet = async (connector: InjectedConnector | WalletConnectConnector, name: string) => {
    try {
      setConnecting(true);
      setSelectedWallet(name);
      await activate(connector);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await deactivate();
      setSelectedWallet(null);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#171B26] rounded-xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">
          {active ? 'Wallet Connected' : 'Connect Wallet'}
        </h2>

        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Error connecting wallet. Please try again.</span>
          </div>
        )}

        {active && account ? (
          <div className="space-y-4">
            <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-3 rounded-lg flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              <span>Wallet connected successfully!</span>
            </div>
            
            <div className="bg-[#0B0E15] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Connected Account</div>
              <div className="text-white font-mono">
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full bg-red-600 text-white rounded-lg py-3 font-semibold hover:bg-red-700 transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => connectWallet(injected, 'MetaMask')}
              disabled={connecting}
              className="w-full bg-[#0B0E15] hover:bg-[#1f2937] text-white rounded-lg p-4 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center">
                <Wallet className="w-6 h-6 mr-3" />
                <span>MetaMask</span>
              </div>
              {connecting && selectedWallet === 'MetaMask' && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
            </button>

            <button
              onClick={() => connectWallet(walletconnect, 'WalletConnect')}
              disabled={connecting}
              className="w-full bg-[#0B0E15] hover:bg-[#1f2937] text-white rounded-lg p-4 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center">
                <Wallet className="w-6 h-6 mr-3" />
                <span>WalletConnect</span>
              </div>
              {connecting && selectedWallet === 'WalletConnect' && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}