import React, { useState } from 'react';
import { LedgerType, UserProfile } from '../types';
import { Mic, Plus, Wallet, ShieldCheck, User as UserIcon, Lock, Sparkles, Building2, User, Users, Play, Menu, X, ChevronDown } from 'lucide-react';

interface NavbarProps {
  activeLedger: LedgerType;
  onSelectLedger: (ledger: LedgerType) => void;
  user: UserProfile;
  onOpenVoiceModal: () => void;
  onOpenAddModal: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onOpenSMSModal: () => void;
  onOpenVideoDemo?: () => void;
  isLoggedIn: boolean;
  onLockApp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeLedger,
  onSelectLedger,
  user,
  onOpenVoiceModal,
  onOpenAddModal,
  onOpenProfile,
  onOpenAuth,
  onOpenSMSModal,
  onOpenVideoDemo,
  isLoggedIn,
  onLockApp,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#121417] border-b border-gray-800 text-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Header Bar: Logo + Brand + Profile Avatar + Quick Toggle */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 text-white font-bold shadow-sm">
              <Wallet className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-[#121417]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-white">
                  E-moneyLog
                </span>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                  🇳🇬 NGN
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400">
                AI Voice Cash Book & Assistant
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Ledger Switcher */}
          <div className="hidden lg:flex items-center p-1 bg-black/40 rounded-lg border border-gray-800">
            <button
              onClick={() => onSelectLedger('business')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeLedger === 'business'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Business Book</span>
            </button>
            <button
              onClick={() => onSelectLedger('personal')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeLedger === 'personal'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Personal Book</span>
            </button>
            <button
              onClick={() => onSelectLedger('joint')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeLedger === 'joint'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Joint / Store</span>
            </button>
          </div>

          {/* Right Header Controls: Profile Picture & Key Actions */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            
            {/* User Profile Avatar & Name Button - Visible on ALL screen sizes */}
            {isLoggedIn ? (
              <button
                onClick={onOpenProfile}
                className="flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 transition-all shadow-sm group cursor-pointer"
                title="Click to view Profile & Account Settings"
              >
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0 overflow-hidden border-2 border-emerald-400 bg-emerald-800 flex items-center justify-center shadow-xs">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName || 'User Profile'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.classList.add('bg-emerald-600', 'text-white', 'font-bold', 'text-xs');
                          parent.innerText = (user.fullName || 'A').charAt(0).toUpperCase();
                        }
                      }}
                    />
                  ) : (
                    <span className="text-xs font-bold text-white uppercase">
                      {(user.fullName || 'A').charAt(0)}
                    </span>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#121417] rounded-full" />
                </div>
                <div className="flex flex-col text-left pr-1">
                  <span className="text-xs font-extrabold text-white group-hover:text-emerald-300 transition-colors line-clamp-1 max-w-[90px] sm:max-w-[130px]">
                    {user.fullName || 'My Account'}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-300/90 leading-tight">
                    Profile & Settings
                  </span>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>Log In</span>
              </button>
            )}

            {/* Lock PIN Button if Biometrics Enabled */}
            {isLoggedIn && user.isBiometricsEnabled && (
              <button
                onClick={onLockApp}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 hover:text-amber-400 border border-gray-700 transition-colors"
                title="Lock E-moneyLog with PIN"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            {/* Mobile / Tablet Nav Expand Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
              title="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Dedicated Quick Features Action Navigation Bar (Desktop & Always Accessible Bar) */}
        <div className="hidden lg:flex items-center justify-between py-2 border-t border-gray-800/80 gap-3">
          
          <div className="flex items-center space-x-2.5">
            {/* AI Voice Log Button */}
            <button
              onClick={onOpenVoiceModal}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Mic className="w-4 h-4 text-white" />
              <span>AI Voice Log</span>
            </button>

            {/* Add Log Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-gray-700 text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Manual Log</span>
            </button>

            {/* Bank SMS Sync Button */}
            <button
              onClick={onOpenSMSModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Bank SMS Sync</span>
            </button>

            {/* Video Walkthrough Guide Button */}
            {onOpenVideoDemo && (
              <button
                onClick={onOpenVideoDemo}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors animate-pulse"
              >
                <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>Video Walkthrough (60s)</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit Offline Logged</span>
          </div>

        </div>

        {/* Mobile / Tablet Responsive Navigation Bar & Drawer */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden border-t border-gray-800 ${
          isMobileMenuOpen ? 'max-h-96 py-3 space-y-3' : 'max-h-0 py-0 opacity-0'
        }`}>
          
          {/* Mobile Ledger Selection Row */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
              Select Cash Book Ledger:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onSelectLedger('business');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center space-x-1.5 p-2 rounded-lg text-xs font-bold border transition-all ${
                  activeLedger === 'business'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    : 'bg-gray-900 text-gray-300 border-gray-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Business</span>
              </button>
              <button
                onClick={() => {
                  onSelectLedger('personal');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center space-x-1.5 p-2 rounded-lg text-xs font-bold border transition-all ${
                  activeLedger === 'personal'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    : 'bg-gray-900 text-gray-300 border-gray-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Personal</span>
              </button>
              <button
                onClick={() => {
                  onSelectLedger('joint');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center space-x-1.5 p-2 rounded-lg text-xs font-bold border transition-all ${
                  activeLedger === 'joint'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    : 'bg-gray-900 text-gray-300 border-gray-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Joint / Store</span>
              </button>
            </div>
          </div>

          {/* Mobile / Tablet Quick Features Grid */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
              Quick App Actions:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onOpenVoiceModal();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-2 p-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-xs"
              >
                <Mic className="w-4 h-4" />
                <span>AI Voice Log</span>
              </button>

              <button
                onClick={() => {
                  onOpenAddModal();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs font-bold"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Log Entry</span>
              </button>

              <button
                onClick={() => {
                  onOpenSMSModal();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Bank SMS Sync</span>
              </button>

              {onOpenVideoDemo && (
                <button
                  onClick={() => {
                    onOpenVideoDemo();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-1.5 p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold animate-pulse"
                >
                  <Play className="w-4 h-4 text-rose-400 fill-rose-400" />
                  <span>Video Guide (60s)</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};


