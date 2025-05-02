import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { Menu, LogIn, LogOut, Wallet } from 'lucide-react';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { auth } from './firebase';
import { User } from 'firebase/auth';
import { SideMenu } from './components/SideMenu';
import { WalletConnect } from './components/WalletConnect';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { HomePage } from './pages/HomePage';

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsSideMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div className="min-h-screen bg-[#0B0E15]">
        {/* Header with burger menu */}
        <header className="bg-[#171B26] border-b border-gray-800">
          <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSideMenuOpen(true)}
                className="text-white hover:text-gray-300"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link to="/" className="text-white text-2xl font-bold">
                Paybis
              </Link>
            </div>

            {/* Auth and Wallet buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="flex items-center bg-[#0B0E15] text-white px-4 py-2 rounded-lg hover:bg-[#1f2937] transition-colors"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </button>

              {!user ? (
                <Link
                  to="/login"
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300">{user.email}</span>
                  <Link to="/profile" className="text-gray-300 hover:text-white">
                    Profile
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </header>

        {/* Side Menu */}
        <SideMenu
          isOpen={isSideMenuOpen}
          onClose={() => setIsSideMenuOpen(false)}
          user={user}
          onSignOut={handleSignOut}
        />

        {/* Wallet Connect Modal */}
        <WalletConnect
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
        />

        {/* Main Content */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <RegisterPage />}
          />
          <Route
            path="/profile"
            element={user ? <ProfilePage /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Web3ReactProvider>
  );
}

export default App;