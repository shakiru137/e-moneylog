import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Lock, Wallet, ArrowRight, ShieldCheck, KeyRound, Check, AlertCircle, Mail, Smartphone, User, X, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: Partial<UserProfile>) => void;
  isPinLockMode?: boolean;
  expectedPin?: string;
  onUnlockPin?: () => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isPinLockMode = false,
  expectedPin = '1234',
  onUnlockPin,
}) => {
  const [loginMethod, setLoginMethod] = useState<'options' | 'google' | 'email' | 'phone'>('options');
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  if (!isOpen && !isPinLockMode) return null;

  // Handles PIN Unlock
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === expectedPin || enteredPin === '1234') {
      onUnlockPin?.();
      setEnteredPin('');
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect PIN code. Default PIN is 1234');
    }
  };

  // Google Login Handler
  const handleGoogleSelect = (selectedEmail: string, selectedName: string, avatarUrl?: string) => {
    onLoginSuccess({
      email: selectedEmail,
      fullName: selectedName,
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      state: 'Lagos',
    });
    onClose();
  };

  // Phone OTP Handler
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!phone) {
      setErrorMsg('Please enter a valid phone number');
      return;
    }
    if (!isOtpSent) {
      setIsOtpSent(true);
      return;
    }
    if (otpCode.length < 4) {
      setErrorMsg('Please enter the 4-digit OTP code');
      return;
    }
    onLoginSuccess({
      phone,
      fullName: 'Amina Babangida',
      email: 'amina@emoneylog.ng',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      state: 'Lagos',
    });
    onClose();
  };

  // Handles Standard Email Login / Signup / Recovery
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'forgot') {
      if (!email) {
        setErrorMsg('Please enter your email address');
        return;
      }
      setResetSent(true);
      return;
    }

    if (!email || !password) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    onLoginSuccess({
      email,
      fullName: fullName || 'Amina Babangida',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      state: 'Lagos',
    });

    onClose();
  };

  // If in PIN Lock Screen Mode
  if (isPinLockMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-gray-800">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-6 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-sm">
            <Lock className="w-7 h-7 text-white" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900">E-moneyLog Locked</h3>
            <p className="text-xs text-gray-500 mt-1">
              Enter your 4-digit security PIN to unlock your cash book
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={4}
              autoFocus
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              placeholder="••••"
              className="w-40 mx-auto px-4 py-2.5 bg-gray-50 border-2 border-gray-200 focus:border-emerald-500 rounded-xl text-center font-mono text-2xl text-gray-900 tracking-widest focus:outline-none focus:bg-white"
            />

            {errorMsg && (
              <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded-md border border-rose-200">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md shadow-xs transition-colors"
            >
              Unlock Cash Book
            </button>
          </form>

          <p className="text-[11px] text-gray-500">
            Default PIN for demo: <span className="font-mono font-bold text-amber-700">1234</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden text-gray-800 p-6 space-y-5">
        
        {/* Modal Header & Dismiss */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                E-moneyLog Sign In
              </h3>
              <p className="text-[11px] text-gray-500">
                AI Voice Cash Book & Assistant for Nigeria 🇳🇬
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MULTI-OPTION SELECTION SCREEN */}
        {loginMethod === 'options' && (
          <div className="space-y-3 pt-1">
            <p className="text-xs font-semibold text-gray-700 text-center mb-2">
              Choose your preferred login method:
            </p>

            {/* Google Sign In Button */}
            <button
              onClick={() => {
                setErrorMsg('');
                setLoginMethod('google');
              }}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-semibold text-xs rounded-lg shadow-2xs flex items-center justify-center space-x-3 transition-colors group"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            {/* Email Sign In Button */}
            <button
              onClick={() => {
                setErrorMsg('');
                setLoginMethod('email');
              }}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center justify-center space-x-3 transition-colors"
            >
              <Mail className="w-4 h-4 text-white" />
              <span>Continue with Email & Password</span>
            </button>

            {/* Phone OTP Sign In Button */}
            <button
              onClick={() => {
                setErrorMsg('');
                setLoginMethod('phone');
              }}
              className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 font-semibold text-xs rounded-lg shadow-2xs flex items-center justify-center space-x-3 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>Continue with Phone Number / SMS</span>
            </button>

            <div className="pt-3 border-t border-gray-100 text-center">
              <p className="text-[11px] text-gray-500">
                By logging in, you agree to secure data storage for your cash entries.
              </p>
            </div>
          </div>
        )}

        {/* GOOGLE ACCOUNT CHOOSER SCREEN */}
        {loginMethod === 'google' && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-center">
              <GoogleIcon />
              <h4 className="font-bold text-xs text-gray-900 mt-1.5">
                Google Account Authentication
              </h4>
              <p className="text-[11px] text-gray-600">
                Select a Google account to log into E-moneyLog
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() =>
                  handleGoogleSelect(
                    'amina.babangida@gmail.com',
                    'Amina Babangida',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                  )
                }
                className="w-full p-3 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-lg text-left flex items-center space-x-3 transition-colors"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                  alt="Amina"
                  className="w-9 h-9 rounded-full object-cover border border-emerald-500"
                />
                <div className="flex-1 truncate">
                  <p className="text-xs font-bold text-gray-900">Amina Babangida</p>
                  <p className="text-[11px] text-gray-500 truncate">amina.babangida@gmail.com</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Google
                </span>
              </button>

              <button
                onClick={() =>
                  handleGoogleSelect(
                    'yusufshakiruoluwasegun1379@gmail.com',
                    'Yusuf Shakiru',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
                  )
                }
                className="w-full p-3 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-lg text-left flex items-center space-x-3 transition-colors"
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                  alt="Yusuf"
                  className="w-9 h-9 rounded-full object-cover border border-emerald-500"
                />
                <div className="flex-1 truncate">
                  <p className="text-xs font-bold text-gray-900">Yusuf Shakiru</p>
                  <p className="text-[11px] text-gray-500 truncate">yusufshakiruoluwasegun1379@gmail.com</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Google
                </span>
              </button>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="Or enter your custom @gmail.com email"
                  className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => {
                    if (customGoogleEmail.trim()) {
                      handleGoogleSelect(customGoogleEmail, customGoogleEmail.split('@')[0]);
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md shadow-2xs"
                >
                  Login
                </button>
              </div>

              <button
                type="button"
                onClick={() => setLoginMethod('options')}
                className="text-xs text-gray-500 hover:text-gray-800 font-medium block mx-auto pt-1"
              >
                ← Back to Login Options
              </button>
            </div>
          </div>
        )}

        {/* PHONE NUMBER OTP SCREEN */}
        {loginMethod === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone Number (Nigeria 🇳🇬)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0803 123 4567"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs font-mono text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            {isOtpSent && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Enter 4-Digit SMS Code Sent to {phone}
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 4821"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-center font-mono text-base tracking-widest text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
                <p className="text-[10px] text-emerald-700 font-medium">
                  ✓ Demo code: Enter any 4 digits (e.g. 1234)
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md shadow-xs transition-colors"
            >
              {!isOtpSent ? 'Send Verification OTP' : 'Verify & Continue'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOtpSent(false);
                setLoginMethod('options');
              }}
              className="text-xs text-gray-500 hover:text-gray-800 font-medium block mx-auto pt-1"
            >
              ← Back to Login Options
            </button>
          </form>
        )}

        {/* EMAIL LOGIN / SIGNUP SCREEN */}
        {loginMethod === 'email' && (
          <>
            {mode === 'forgot' && resetSent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-gray-900">Password Recovery Link Sent!</h4>
                <p className="text-xs text-gray-700">
                  We have sent an OTP reset code to <span className="font-bold text-emerald-700">{email}</span>. Check your inbox to set a new password.
                </p>
                <button
                  onClick={() => {
                    setMode('login');
                    setResetSent(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md shadow-xs transition-colors"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Amina Babangida"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. amina@emoneylog.ng"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-700">
                        Password
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-[11px] text-amber-700 hover:underline font-semibold"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md shadow-xs transition-colors"
                  >
                    {mode === 'login' ? 'Log In' : mode === 'signup' ? 'Create Account' : 'Reset Link'}
                  </button>
                </div>
              </form>
            )}

            {/* Footer Toggle */}
            <div className="text-center pt-2 border-t border-gray-200 text-xs text-gray-500 space-y-1.5">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Log In
                  </button>
                </p>
              )}

              <button
                type="button"
                onClick={() => setLoginMethod('options')}
                className="text-xs text-gray-500 hover:text-gray-800 font-medium block mx-auto pt-1"
              >
                ← Back to Login Options
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

