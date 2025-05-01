import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { ExchangeWidget } from '../components/ExchangeWidget';

export function HomePage() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-8">
          Buy Bitcoin and Crypto Instantly
        </h2>
        
        <ExchangeWidget />

        {/* Features section from your existing App.tsx */}
        {/* Trust indicators section from your existing App.tsx */}
        {/* Footer section from your existing App.tsx */}
      </div>
    </main>
  );
}