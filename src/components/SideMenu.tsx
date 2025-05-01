import React from 'react';
import { Link } from 'react-router-dom';
import { X, Home, LogIn, UserPlus, User, LogOut } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: FirebaseUser | null;
  onSignOut: () => void;
}

export function SideMenu({ isOpen, onClose, user, onSignOut }: SideMenuProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Side Menu */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-[#171B26] transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mt-8 space-y-6">
            <Link
              to="/"
              className="flex items-center text-gray-300 hover:text-white"
              onClick={onClose}
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </Link>

            {!user ? (
              <>
                <Link
                  to="/login"
                  className="flex items-center text-gray-300 hover:text-white"
                  onClick={onClose}
                >
                  <LogIn className="w-5 h-5 mr-3" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center text-gray-300 hover:text-white"
                  onClick={onClose}
                >
                  <UserPlus className="w-5 h-5 mr-3" />
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  className="flex items-center text-gray-300 hover:text-white"
                  onClick={onClose}
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  className="flex items-center text-red-400 hover:text-red-300 w-full"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}