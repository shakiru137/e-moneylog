import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Camera, Shield, Lock, Check, KeyRound, Smartphone, Volume2, Globe, LogOut, AlertTriangle } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
}) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [businessName, setBusinessName] = useState(user.businessName);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [state, setState] = useState(user.state);
  const [city, setCity] = useState(user.city);
  const [pin, setPin] = useState(user.pin);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(user.isBiometricsEnabled);
  const [isVoiceFeedbackEnabled, setIsVoiceFeedbackEnabled] = useState(user.isVoiceFeedbackEnabled);
  const [preferredLanguage, setPreferredLanguage] = useState(user.preferredLanguage);

  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState(user.email);
  const [otpSent, setOtpSent] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isOpen) return null;

  // Handle image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      fullName,
      email,
      phone,
      businessName,
      avatarUrl,
      state,
      city,
      pin,
      isBiometricsEnabled,
      isVoiceFeedbackEnabled,
      preferredLanguage,
    });
    setSuccessMsg('Profile settings updated successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleSendRecoveryOTP = () => {
    setOtpSent(true);
  };

  const NIGERIA_STATES = [
    'Lagos', 'Abuja (FCT)', 'Rivers', 'Kano', 'Oyo', 'Anambra', 'Ogun', 'Kaduna',
    'Edo', 'Enugu', 'Delta', 'Akwa Ibom', 'Ondo', 'Imo', 'Abia', 'Plateau'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden text-gray-800 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-base text-gray-900">Profile & Account Settings</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Avatar & Photo Upload */}
          <div className="flex flex-col items-center space-y-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-600 shadow-sm bg-emerald-800 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile Avatar"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.classList.add('bg-emerald-600', 'text-white', 'font-bold', 'text-xl');
                        parent.innerText = (fullName || 'U').charAt(0).toUpperCase();
                      }
                    }}
                  />
                ) : (
                  <span className="text-xl font-bold text-white uppercase">
                    {(fullName || 'U').charAt(0)}
                  </span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm cursor-pointer transition-colors" title="Upload custom photo">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            
            <div className="text-center">
              <p className="text-xs font-bold text-gray-800">Profile Picture</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Upload your custom photo or select a default preset below
              </p>
            </div>

            {/* Avatar Presets */}
            <div className="flex items-center space-x-2 pt-1">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
              ].map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setAvatarUrl(preset)}
                  className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                    avatarUrl === preset ? 'border-emerald-600 scale-110 ring-2 ring-emerald-400' : 'border-gray-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt={`Preset ${index + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Business / Store Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number (WhatsApp)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  State in Nigeria
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                >
                  {NIGERIA_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  City / LGA
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* AI Preferences */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <h4 className="font-bold text-xs text-gray-900 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Language & Audio Voice</span>
              </h4>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-gray-800 block">AI Language Focus</span>
                  <span className="text-[11px] text-gray-500">Select dialect context</span>
                </div>
                <select
                  value={preferredLanguage}
                  onChange={(e: any) => setPreferredLanguage(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-gray-900"
                >
                  <option value="English">English</option>
                  <option value="Pidgin">Nigerian Pidgin</option>
                  <option value="Yoruba">Yoruba</option>
                  <option value="Igbo">Igbo</option>
                  <option value="Hausa">Hausa</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200">
                <div>
                  <span className="font-semibold text-gray-800 block">Voice Readback ("Speak Back")</span>
                  <span className="text-[11px] text-gray-500">Read AI confirmations aloud</span>
                </div>
                <input
                  type="checkbox"
                  checked={isVoiceFeedbackEnabled}
                  onChange={(e) => setIsVoiceFeedbackEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
              </div>
            </div>

            {/* Security Section */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <h4 className="font-bold text-xs text-gray-900 flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Security & App Lock PIN</span>
              </h4>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-gray-800 block">Biometric / PIN Screen Lock</span>
                  <span className="text-[11px] text-gray-500">Require PIN code on app open</span>
                </div>
                <input
                  type="checkbox"
                  checked={isBiometricsEnabled}
                  onChange={(e) => setIsBiometricsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
              </div>

              {isBiometricsEnabled && (
                <div className="pt-2 border-t border-gray-200">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    4-Digit Security PIN:
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-32 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-center font-mono text-base text-gray-900 tracking-widest focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Password Recovery Link */}
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowPasswordRecovery(!showPasswordRecovery)}
                  className="text-xs text-amber-700 hover:underline font-semibold flex items-center space-x-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Forgotten Password / Reset</span>
                </button>
              </div>

              {/* Password Recovery Simulation Box */}
              {showPasswordRecovery && (
                <div className="p-3 bg-white rounded-lg border border-amber-300 text-xs space-y-2">
                  <p className="text-gray-700 font-medium">
                    Reset your password via OTP link sent to your registered email:
                  </p>
                  {!otpSent ? (
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={handleSendRecoveryOTP}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-md"
                      >
                        Send OTP
                      </button>
                    </div>
                  ) : (
                    <p className="text-emerald-700 font-bold flex items-center space-x-1">
                      <Check className="w-4 h-4" />
                      <span>OTP Recovery Link sent to {recoveryEmail}! Check your inbox.</span>
                    </p>
                  )}
                </div>
              )}

            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md shadow-xs transition-colors"
              >
                Save Profile Changes
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-md transition-colors flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>

          </form>

        </div>

        {/* LOGOUT PERMISSION CONFIRMATION MODAL */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-gray-800">
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">Confirm Permission to Log Out</h4>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Are you sure you want to log out of E-moneyLog? Your cash book session will be locked until you authenticate again.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-md shadow-xs transition-colors"
                >
                  Yes, Confirm Logout
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
