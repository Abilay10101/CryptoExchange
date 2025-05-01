import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { auth } from '../firebase';
import { UserProfile, countries, validateIIN } from '../types/user';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function ProfileModal({ isOpen, onClose, onComplete }: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile>({
    nickname: '',
    firstName: '',
    lastName: '',
    country: '',
    iin: '',
    uid: auth.currentUser?.uid || '',
  });

  const [errors, setErrors] = useState<Partial<UserProfile>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'userProfiles', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      }
    };
    fetchProfile();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserProfile> = {};

    if (!profile.nickname.trim()) newErrors.nickname = 'Nickname is required';
    if (!profile.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!profile.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!profile.country) newErrors.country = 'Country is required';

    if (profile.country === 'Kazakhstan') {
      if (!profile.iin) {
        newErrors.iin = 'IIN is required for Kazakhstan residents';
      } else if (!validateIIN(profile.iin)) {
        newErrors.iin = 'IIN must be exactly 12 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'userProfiles', auth.currentUser.uid), profile);
        onComplete();
        onClose();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
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
        
        <h2 className="text-2xl font-bold text-white mb-6">Complete Your Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Nickname
            </label>
            <input
              type="text"
              value={profile.nickname}
              onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
              className="w-full bg-[#0B0E15] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter your nickname"
            />
            {errors.nickname && (
              <p className="text-red-500 text-sm mt-1">{errors.nickname}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              className="w-full bg-[#0B0E15] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter your first name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              className="w-full bg-[#0B0E15] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter your last name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Country
            </label>
            <select
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              className="w-full bg-[#0B0E15] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select your country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country}</p>
            )}
          </div>

          {profile.country === 'Kazakhstan' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                IIN (Individual Identification Number)
              </label>
              <input
                type="text"
                value={profile.iin}
                onChange={(e) => setProfile({ ...profile, iin: e.target.value })}
                maxLength={12}
                className="w-full bg-[#0B0E15] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter your 12-digit IIN"
              />
              {errors.iin && (
                <p className="text-red-500 text-sm mt-1">{errors.iin}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}