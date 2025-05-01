import React from 'react';
import { Check, X } from 'lucide-react';

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromAmount: string;
  toAmount: string;
  fromCurrency: string;
  toCurrency: string;
}

export function PurchaseConfirmationModal({
  isOpen,
  onClose,
  fromAmount,
  toAmount,
  fromCurrency,
  toCurrency,
}: PurchaseConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    // Here you would typically handle the actual purchase
    // For now, we'll just close the modal
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#171B26] rounded-xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center justify-center mb-6">
          <div className="bg-green-500 bg-opacity-20 rounded-full p-3">
            <Check className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Confirm Your Purchase
        </h2>

        <div className="space-y-4 mb-6">
          <div className="bg-[#0B0E15] p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">You Send</div>
            <div className="text-xl text-white">
              {fromAmount} {fromCurrency}
            </div>
          </div>

          <div className="bg-[#0B0E15] p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">You Receive</div>
            <div className="text-xl text-white">
              {toAmount} {toCurrency}
            </div>
          </div>

          <div className="bg-[#0B0E15] p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Delivery Time</div>
            <div className="text-xl text-white">Instant</div>
          </div>

          <div className="bg-[#0B0E15] p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Payment Method</div>
            <div className="text-xl text-white">Credit Card</div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-colors"
          >
            Confirm Purchase
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-transparent border border-gray-600 text-white rounded-lg py-3 font-semibold hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}