import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface ConfirmationPageProps {
  email: string;
  onBack: () => void;
  onConfirm: (code: string) => void;
}

export function ConfirmationPage({ email, onBack, onConfirm }: ConfirmationPageProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(code);
  };

  return (
    <div className="bg-[#171B26] rounded-xl p-8 max-w-md w-full mx-4">
      <button
        onClick={onBack}
        className="flex items-center text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <h2 className="text-2xl font-bold text-white mb-2">
        Check your email
      </h2>
      <p className="text-gray-400 mb-6">
        We've sent a confirmation code to {email}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-400 mb-1">
            Confirmation Code
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-[#0B0E15] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-colors"
        >
          Verify Email
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => {
            // Here you would typically resend the confirmation code
            console.log('Resending code to:', email);
          }}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          Didn't receive the code? Send again
        </button>
      </div>
    </div>
  );
}