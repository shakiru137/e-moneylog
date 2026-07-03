import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import {
  Lock,
  Wallet,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Check,
  AlertCircle,
  Mail,
  Smartphone,
  User,
  X,
  Sparkles,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: Partial<UserProfile>) => void;
  isPinLockMode?: boolean;
  expectedPin?: string;
  onUnlockPin?: () => void;
  isFullScreenView?: boolean;
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

const AppleIcon = () => (
  <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.97.99-3.12-1 .04-2.22.67-2.92 1.49-.62.72-1.16 1.88-1.01 3.01 1.12.09 2.27-.56 2.94-1.38z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path fill="#F25022" d="M1 1h10v10H1z" />
    <path fill="#7FBA00" d="M13 1h10v10H1z" />
    <path fill="#00A4EF" d="M1 13h10v10H1z" />
    <path fill="#FFB900" d="M13 13h10v10H13z" />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isPinLockMode = false,
  expectedPin = '1234',
  onUnlockPin,
  isFullScreenView = false,
}) => {
  const [loginMethod, setLoginMethod] = useState<'options' | 'google' | 'apple' | 'microsoft' | 'email' | 'phone'>('options');
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset_step_2'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  // Password Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Recovery / OTP
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  
  // UI States
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (!isOpen && !isPinLockMode && !isFullScreenView) return null;

  // Handles PIN Unlock
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === expectedPin || enteredPin === '1234') {
      onUnlockPin?.();
      setEnteredPin('');
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect Security PIN code. Default PIN is 1234');
    }
  };

  // Social Login Handler (Google, Apple, Microsoft)
  const handleSocialSelect = (provider: 'Google' | 'Apple' | 'Microsoft', selectedEmail: string, selectedName: string, avatarUrl?: string) => {
    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      onLoginSuccess({
        email: selectedEmail,
        fullName: selectedName,
        businessName: businessName || 'My Business',
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        state: 'Lagos',
      });
      if (isMountedRef.current) {
        setIsLoading(false);
        if (!isFullScreenView) onClose();
      }
    }, 600);
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
      setErrorMsg('Please enter the 4-digit SMS OTP code');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        phone,
        fullName: fullName || 'Amina Babangida',
        email: email || `user_${phone.replace(/\D/g, '')}@emoneylog.ng`,
        businessName: businessName || 'Amina Store',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        state: 'Lagos',
      });
      if (isMountedRef.current) {
        setIsLoading(false);
        if (!isFullScreenView) onClose();
      }
    }, 600);
  };

  // Standard Email Login / Signup / Recovery Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // FORGOT PASSWORD STEP 1: Submit Email
    if (mode === 'forgot') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        setErrorMsg('Please enter a valid email address');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsLoading(false);
          setMode('reset_step_2');
          setSuccessMsg(`Passcode reset token sent to ${email}. Enter the 6-digit code below.`);
        }
      }, 700);
      return;
    }

    // FORGOT PASSWORD STEP 2: Enter Token & New Password
    if (mode === 'reset_step_2') {
      if (!resetCode || resetCode.length < 6) {
        setErrorMsg('Please enter the 6-digit reset code sent to your email');
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setErrorMsg('New passwords do not match');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsLoading(false);
          setMode('login');
          setSuccessMsg('Your password has been reset successfully! Please log in with your new password.');
          setPassword('');
          setResetCode('');
        }
      }, 800);
      return;
    }

    // SIGN UP VALIDATION
    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        setErrorMsg('Please enter a valid email address');
        return;
      }
      if (!password || password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }
    }

    // LOGIN VALIDATION
    if (mode === 'login') {
      if (!email || !password) {
        setErrorMsg('Invalid email or password combination. Please try again.');
        return;
      }
    }

    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        email,
        fullName: fullName || (email.includes('yusuf') ? 'Yusuf Shakiru' : 'Amina Babangida'),
        businessName: businessName || 'My Enterprise',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        state: 'Lagos',
      });
      if (isMountedRef.current) {
        setIsLoading(false);
        if (!isFullScreenView) onClose();
      }
    }, 700);
  };

  // If in PIN Lock Screen Mode
  if (isPinLockMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in text-gray-800">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-md">
            <Lock className="w-7 h-7 text-white" />
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-gray-900">E-moneyLog Security Lock</h3>
            <p className="text-xs text-gray-500 mt-1">
              Enter your 4-digit security PIN to access your cash book
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
              <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {errorMsg}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onUnlockPin}
                className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Unlock
              </button>
            </div>
          </form>

          <p className="text-[11px] text-gray-500">
            Default PIN for demo: <span className="font-mono font-bold text-amber-700">1234</span>
          </p>
        </div>
      </div>
    );
  }

  // Content Component rendered inside Fullscreen Page or Modal
  const authFormContent = (
    <div className="w-full max-w-md mx-auto bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden text-gray-800 p-6 sm:p-7 space-y-5">
      
      {/* Header & Brand Title */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold shadow-sm">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">
              {mode === 'signup'
                ? 'Create Free Account'
                : mode === 'forgot' || mode === 'reset_step_2'
                ? 'Password Recovery'
                : 'Sign In to Cash Book'}
            </h3>
            <p className="text-[11px] font-medium text-gray-500">
              AI Voice Cash Book & Debt Ledger 🇳🇬
            </p>
          </div>
        </div>
        {!isFullScreenView && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Close Authentication Dialog"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* MULTI-OPTION SELECTION SCREEN */}
      {loginMethod === 'options' && (
        <div className="space-y-3.5 pt-1">
          <p className="text-xs font-semibold text-gray-600 text-center mb-1">
            Sign in or create account using:
          </p>

          {/* Social Logins */}
          <div className="space-y-2">
            {/* Google */}
            <button
              onClick={() => {
                setErrorMsg('');
                setLoginMethod('google');
              }}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center space-x-3 transition-all hover:border-gray-400 group"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            {/* Apple */}
            <button
              onClick={() => {
                setErrorMsg('');
                setLoginMethod('apple');
              }}
              className="w-full py-2.5 px-4 bg-black hover:bg-gray-900 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center space-x-3 transition-all"
            >
              <AppleIcon />
              <span>Continue with Apple ID</span>
            </button>

            {/* Microsoft */}
            <button
              onClick={() => {
                setErrorMsg('');
                setLoginMethod('microsoft');
              }}
              className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center space-x-3 transition-all"
            >
              <MicrosoftIcon />
              <span>Continue with Microsoft</span>
            </button>
          </div>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400">
              <span className="bg-white px-2">Or Use Direct Credentials</span>
            </div>
          </div>

          {/* Email Sign In Button */}
          <button
            onClick={() => {
              setErrorMsg('');
              setLoginMethod('email');
            }}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <Mail className="w-4 h-4 text-white" />
            <span>Email & Password Credentials</span>
          </button>

          {/* Phone OTP Sign In Button */}
          <button
            onClick={() => {
              setErrorMsg('');
              setLoginMethod('phone');
            }}
            className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            <Smartphone className="w-4 h-4 text-emerald-700" />
            <span>Phone Number & SMS Verification</span>
          </button>

          {!isFullScreenView && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors mt-2"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* GOOGLE SELECTOR SCREEN */}
      {loginMethod === 'google' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-center">
            <div className="flex justify-center mb-1">
              <GoogleIcon />
            </div>
            <h4 className="font-bold text-xs text-gray-900">
              Google Account Sign In
            </h4>
            <p className="text-[11px] text-gray-600">
              Select an account to authorize E-moneyLog
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() =>
                handleSocialSelect(
                  'Google',
                  'amina.babangida@gmail.com',
                  'Amina Babangida',
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                )
              }
              className="w-full p-3 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-xl text-left flex items-center space-x-3 transition-colors"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                alt="Amina"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500"
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
                handleSocialSelect(
                  'Google',
                  'yusufshakiruoluwasegun1379@gmail.com',
                  'Yusuf Shakiru',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
                )
              }
              className="w-full p-3 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-xl text-left flex items-center space-x-3 transition-colors"
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                alt="Yusuf"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500"
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
                placeholder="Or enter custom @gmail.com"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => {
                  if (customGoogleEmail.trim()) {
                    handleSocialSelect('Google', customGoogleEmail, customGoogleEmail.split('@')[0]);
                  }
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-2xs"
              >
                Sign In
              </button>
            </div>

            <button
              type="button"
              onClick={() => setLoginMethod('options')}
              className="text-xs text-gray-500 hover:text-gray-800 font-bold block mx-auto pt-1"
            >
              ← Back to All Options
            </button>
          </div>
        </div>
      )}

      {/* APPLE / MICROSOFT SELECTOR SCREEN */}
      {(loginMethod === 'apple' || loginMethod === 'microsoft') && (
        <div className="space-y-4 text-center">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <div className="flex justify-center">
              {loginMethod === 'apple' ? <AppleIcon /> : <MicrosoftIcon />}
            </div>
            <h4 className="font-bold text-xs text-gray-900">
              {loginMethod === 'apple' ? 'Apple ID Sign In' : 'Microsoft Account Sign In'}
            </h4>
            <p className="text-xs text-gray-600">
              Authenticate securely using your {loginMethod === 'apple' ? 'Apple' : 'Microsoft'} single sign-on credentials.
            </p>
          </div>

          <button
            onClick={() =>
              handleSocialSelect(
                loginMethod === 'apple' ? 'Apple' : 'Microsoft',
                `user_${loginMethod}@emoneylog.ng`,
                `Verified ${loginMethod === 'apple' ? 'Apple' : 'Microsoft'} User`
              )
            }
            disabled={isLoading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <span>Authorize & Continue</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setLoginMethod('options')}
            className="text-xs text-gray-500 hover:text-gray-800 font-bold block mx-auto"
          >
            ← Back to All Options
          </button>
        </div>
      )}

      {/* PHONE NUMBER OTP SCREEN */}
      {loginMethod === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Phone Number (Nigeria 🇳🇬)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0803 123 4567"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {isOtpSent && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                Enter 4-Digit SMS Code Sent to {phone}
              </label>
              <input
                type="text"
                maxLength={4}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="e.g. 1234"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center font-mono text-base tracking-widest text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
              <p className="text-[10px] text-emerald-700 font-semibold">
                ✓ Demo code: Enter 1234 or any 4 digits
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsOtpSent(false);
                setLoginMethod('options');
              }}
              className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              {!isOtpSent ? 'Send OTP Code' : 'Verify & Continue'}
            </button>
          </div>
        </form>
      )}

      {/* EMAIL & PASSWORD SCREEN */}
      {loginMethod === 'email' && (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Sign Up Specific Fields */}
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Amina Babangida"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Business / Store Name <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Amina Provisions Store"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </>
          )}

          {/* Email Field (Used in Login, Signup, Forgot Password) */}
          {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. amina@emoneylog.ng"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          )}

          {/* Password Field in Login & Signup */}
          {(mode === 'login' || mode === 'signup') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setMode('forgot');
                    }}
                    className="text-[11px] text-amber-700 hover:underline font-bold"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password Field in Signup */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Remember Me Checkbox on Login */}
          {mode === 'login' && (
            <div className="flex items-center space-x-2 pt-0.5">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs text-gray-600 font-medium cursor-pointer">
                Remember me on this browser
              </label>
            </div>
          )}

          {/* Reset Step 2: Code & New Password */}
          {mode === 'reset_step_2' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Enter 6-Digit Reset Passcode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="e.g. 849201"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center font-mono text-base font-bold tracking-widest text-gray-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </>
          )}

          {/* Submit & Cancel Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setSuccessMsg('');
                setLoginMethod('options');
              }}
              className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : (
                <span>
                  {mode === 'login'
                    ? 'Log In'
                    : mode === 'signup'
                    ? 'Create Free Account'
                    : mode === 'forgot'
                    ? 'Send Reset Code'
                    : 'Save New Password'}
                </span>
              )}
            </button>
          </div>

          {/* Toggle Login vs Sign Up vs Forgot */}
          <div className="text-center pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1.5">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setMode('signup');
                  }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Sign Up Free
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setMode('login');
                  }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Log In
                </button>
              </p>
            )}
          </div>

        </form>
      )}

    </div>
  );

  // If Full Screen View (App startup pre-auth)
  if (isFullScreenView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#121417] via-[#1A1C1E] to-[#0A2E23] flex items-center justify-center p-4 sm:p-6 text-gray-100 font-sans antialiased">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Hero Branding Section */}
          <div className="hidden lg:flex flex-col space-y-6 text-left pr-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black shadow-md">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  E-moneyLog
                </h1>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  Nigeria 🇳🇬 Cash Book
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-white leading-tight">
                AI Voice Cash Book & Debt Ledger for Modern Businesses
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed">
                Log your cash in, cash out, customer debts ("Owo Gbese"), and bank SMS alerts naturally in English or Nigerian Pidgin. Total multi-user data privacy & isolation.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center space-x-3 text-xs font-semibold text-emerald-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>100% Isolated Data Storage per User Account</span>
              </div>
              <div className="flex items-center space-x-3 text-xs font-semibold text-emerald-300">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Instant Bank SMS & Voice Recording Recognition</span>
              </div>
              <div className="flex items-center space-x-3 text-xs font-semibold text-emerald-300">
                <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Multi-Ledger: Business, Personal, & Joint Books</span>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div>
            {authFormContent}
          </div>

        </div>
      </div>
    );
  }

  // standard Modal View
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      {authFormContent}
    </div>
  );
};
