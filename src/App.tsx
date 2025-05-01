import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { Menu, LogIn, LogOut } from 'lucide-react';
import { auth } from './firebase';
import { User } from 'firebase/auth';
import { SideMenu } from './components/SideMenu';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { HomePage } from './pages/HomePage';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Close side menu when route changes
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

          {/* Auth buttons in header */}
          <div className="flex items-center space-x-4">
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
  );
}

export default App;