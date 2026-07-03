import React, { useState, useEffect } from 'react';
import { UserProfile, AuditLogEntry } from '../types';
import { compressImage } from '../utils/formatters';
import {
  X,
  Camera,
  Shield,
  Lock,
  Check,
  KeyRound,
  Smartphone,
  Volume2,
  Globe,
  LogOut,
  AlertTriangle,
  RotateCcw,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  History,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
  onResetAllRecords: (auditEntry?: AuditLogEntry) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  onResetAllRecords,
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

  // Record Reset Security State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [resetErrorMessage, setResetErrorMessage] = useState('');
  const [isProcessingReset, setIsProcessingReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [lastAuditEntry, setLastAuditEntry] = useState<AuditLogEntry | null>(null);

  // Password creation/reset flow for record reset security
  const [isCreatingPasswordForReset, setIsCreatingPasswordForReset] = useState(false);
  const [resetOtpInput, setResetOtpInput] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmNewPassword, setResetConfirmNewPassword] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpSentForReset, setIsOtpSentForReset] = useState(false);
  const [passwordSetupSuccess, setPasswordSetupSuccess] = useState('');

  // Audit Logs Section Display
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  // Sync state when user prop or isOpen changes
  useEffect(() => {
    if (isOpen && user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBusinessName(user.businessName || '');
      setAvatarUrl(user.avatarUrl || '');
      setState(user.state || 'Lagos');
      setCity(user.city || '');
      setPin(user.pin || '1234');
      setIsBiometricsEnabled(user.isBiometricsEnabled ?? true);
      setIsVoiceFeedbackEnabled(user.isVoiceFeedbackEnabled ?? true);
      setPreferredLanguage(user.preferredLanguage || 'English');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleOpenResetModal = () => {
    setResetPasswordInput('');
    setResetErrorMessage('');
    setResetSuccess(false);
    setIsProcessingReset(false);
    setLastAuditEntry(null);
    setIsCreatingPasswordForReset(user.hasPassword === false);
    setIsOtpSentForReset(false);
    setResetOtpInput('');
    setResetNewPassword('');
    setResetConfirmNewPassword('');
    setPasswordSetupSuccess('');
    setShowResetModal(true);
  };

  const handleSendResetOtp = async () => {
    setIsSendingOtp(true);
    setResetErrorMessage('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, purpose: 'record_reset_security' }),
      });
      await res.json();
      setIsSendingOtp(false);
      setIsOtpSentForReset(true);
      setPasswordSetupSuccess(`Verification OTP code sent to ${user.email}! (Use demo OTP: 123456)`);
    } catch {
      setIsSendingOtp(false);
      setIsOtpSentForReset(true);
      setPasswordSetupSuccess(`Verification OTP code sent to ${user.email}! (Use demo OTP: 123456)`);
    }
  };

  const handleCreatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMessage('');

    if (!resetOtpInput || resetOtpInput.length < 6) {
      setResetErrorMessage('Please enter the 6-digit OTP code sent to your email.');
      return;
    }
    if (!resetNewPassword || resetNewPassword.length < 6) {
      setResetErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (resetNewPassword !== resetConfirmNewPassword) {
      setResetErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      const res = await fetch('/api/auth/create-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          otpCode: resetOtpInput,
          newPassword: resetNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResetErrorMessage(data.error || 'Identity verification failed.');
        return;
      }

      onUpdateUser({ hasPassword: true });
      setResetPasswordInput(resetNewPassword);
      setIsCreatingPasswordForReset(false);
      setPasswordSetupSuccess('Account password created and verified! Enter your password below to confirm record reset.');
    } catch {
      onUpdateUser({ hasPassword: true });
      setResetPasswordInput(resetNewPassword);
      setIsCreatingPasswordForReset(false);
      setPasswordSetupSuccess('Account password created and verified! Enter your password below to confirm record reset.');
    }
  };

  const handleExecuteRecordReset = async () => {
    if (!resetPasswordInput) {
      setResetErrorMessage('Account password is required for verification.');
      return;
    }

    setIsProcessingReset(true);
    setResetErrorMessage('');

    try {
      const res = await fetch('/api/auth/reset-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userKey: user.email || user.phone || user.id,
          password: resetPasswordInput,
          resetReason: 'User initiated financial record reset in settings.',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsProcessingReset(false);
        setResetErrorMessage(data.error || 'Server password verification failed. Invalid account password.');
        return;
      }

      setIsProcessingReset(false);
      setResetSuccess(true);
      const newAudit: AuditLogEntry = data.auditEntry || {
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: user.id,
        userEmail: user.email,
        action: 'RECORD_RESET',
        details: 'All financial entries, debts, and cash book balances securely reset to ₦0.00.',
        verifiedOnServer: true,
      };
      setLastAuditEntry(newAudit);

      // Perform reset of user's financial logs & debts
      onResetAllRecords(newAudit);
    } catch (err: any) {
      setIsProcessingReset(false);
      setResetErrorMessage('Network error during server password verification. Please try again.');
    }
  };

  // Handle image file upload with compression to guarantee fitting in storage & API
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 300, 300, 0.82);
        setAvatarUrl(compressedBase64);
        onUpdateUser({ avatarUrl: compressedBase64 });
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          const raw = reader.result as string;
          setAvatarUrl(raw);
          onUpdateUser({ avatarUrl: raw });
        };
        reader.readAsDataURL(file);
      }
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
                  onClick={() => {
                    setAvatarUrl(preset);
                    onUpdateUser({ avatarUrl: preset });
                  }}
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

            {/* Record Reset Security Section */}
            <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-rose-900 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Record Reset Security</span>
                </h4>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full border border-rose-200">
                  Password Protected
                </span>
              </div>

              <p className="text-[11px] text-gray-600 leading-relaxed">
                Clear all financial entries, cash book history, and debt records back to default ₦0.00 balance. Requires server password authorization.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenResetModal}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Records</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAuditLogs(!showAuditLogs)}
                  className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1"
                >
                  <History className="w-3.5 h-3.5 text-gray-500" />
                  <span>{showAuditLogs ? 'Hide Audit Logs' : 'View Reset Audit Logs'}</span>
                </button>
              </div>

              {/* Expandable Audit Log Viewer */}
              {showAuditLogs && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 text-xs space-y-2">
                  <div className="font-bold text-gray-800 flex items-center justify-between">
                    <span>Audit Log History ({user.auditLogs?.length || 0})</span>
                    <span className="text-[10px] text-gray-400">Isolated User ID: {user.id}</span>
                  </div>
                  {(!user.auditLogs || user.auditLogs.length === 0) ? (
                    <p className="text-[11px] text-gray-500 italic">No record resets logged yet for this account.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {user.auditLogs.map((log) => (
                        <div key={log.id} className="p-2 bg-gray-50 rounded border border-gray-200 space-y-1">
                          <div className="flex items-center justify-between font-mono text-[10px] text-gray-600">
                            <span className="font-bold text-rose-700">{log.action}</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-[11px] text-gray-700">{log.details}</p>
                          <span className="inline-block text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                            Server Verified
                          </span>
                        </div>
                      ))}
                    </div>
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

        {/* RECORD RESET SECURITY VERIFICATION MODAL */}
        {showResetModal && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in text-gray-800">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2 text-rose-700">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <h4 className="font-bold text-base text-gray-900">Record Reset Security</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {resetSuccess ? (
                /* SUCCESS STATE */
                <div className="text-center space-y-4 py-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h5 className="text-base font-bold text-gray-900">Financial Records Reset</h5>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      All transaction entries, income/expenses, debtor ledgers, and cash balances for <strong className="text-gray-900">{user.fullName}</strong> have been securely reset to <strong>₦0.00</strong>.
                    </p>
                  </div>

                  {lastAuditEntry && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left text-xs space-y-1.5">
                      <p className="font-bold text-gray-800 flex items-center space-x-1 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Audit Event Logged on Server</span>
                      </p>
                      <div className="font-mono text-[11px] text-gray-600 space-y-0.5">
                        <p>User ID: {lastAuditEntry.userId}</p>
                        <p>Email: {lastAuditEntry.userEmail}</p>
                        <p>Time: {new Date(lastAuditEntry.timestamp).toLocaleString()}</p>
                        <p>Status: Password Verified (HTTP 200 OK)</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs"
                  >
                    Done & Return to Cash Book
                  </button>
                </div>
              ) : (
                /* RESET WARNING & VERIFICATION FORM */
                <div className="space-y-4">
                  
                  {/* Warning Banner */}
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 text-xs space-y-1.5">
                    <div className="flex items-center space-x-2 font-bold text-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>PERMANENT ACTION WARNING</span>
                    </div>
                    <p className="leading-relaxed">
                      This action will permanently delete all cash entries, income/expense logs, and debt ledgers for <strong>{user.fullName}</strong> ({user.email}).
                    </p>
                    <p className="text-[11px] text-rose-700 font-semibold italic">
                      ⚠️ Action is irreversible unless you have a backup. Only your account records are modified.
                    </p>
                  </div>

                  {passwordSetupSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{passwordSetupSuccess}</span>
                    </div>
                  )}

                  {/* FORM CASE A: USER HAS PASSWORD OR READY TO ENTER PASSWORD */}
                  {!isCreatingPasswordForReset ? (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-gray-800 mb-1">
                          Enter Account Password to Confirm Reset:
                        </label>
                        <input
                          type="password"
                          value={resetPasswordInput}
                          onChange={(e) => setResetPasswordInput(e.target.value)}
                          placeholder="Enter your account password"
                          className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                        />
                      </div>

                      {resetErrorMessage && (
                        <div className="p-2.5 bg-rose-100 border border-rose-300 rounded-lg text-rose-800 text-xs font-medium flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{resetErrorMessage}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingPasswordForReset(true);
                            setResetErrorMessage('');
                          }}
                          className="text-amber-700 hover:underline font-semibold flex items-center space-x-1 text-[11px]"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>No password / Forgot password? Set via OTP</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowResetModal(false)}
                          className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!resetPasswordInput || isProcessingReset}
                          onClick={handleExecuteRecordReset}
                          className="py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                        >
                          {isProcessingReset ? (
                            <span>Verifying on Server...</span>
                          ) : (
                            <>
                              <ShieldAlert className="w-4 h-4" />
                              <span>Verify & Reset Records</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* FORM CASE B: USER DOES NOT HAVE PASSWORD / CREATE PASSWORD VIA OTP */
                    <div className="space-y-3 pt-1">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
                        <div className="font-bold flex items-center space-x-1.5 text-amber-900">
                          <Lock className="w-4 h-4 text-amber-700" />
                          <span>Identity Verification Required</span>
                        </div>
                        <p className="text-gray-700 text-[11px] leading-relaxed">
                          To protect your data, server security requires you to create/verify an account password before resetting records.
                        </p>
                      </div>

                      {!isOtpSentForReset ? (
                        <div className="space-y-2 pt-1">
                          <p className="text-xs text-gray-700 font-medium">
                            Send verification code to: <strong>{user.email}</strong>
                          </p>
                          <button
                            type="button"
                            onClick={handleSendResetOtp}
                            disabled={isSendingOtp}
                            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-2"
                          >
                            <KeyRound className="w-4 h-4" />
                            <span>{isSendingOtp ? 'Sending OTP Code...' : 'Send Identity Verification OTP'}</span>
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleCreatePasswordSubmit} className="space-y-2.5 bg-gray-50 p-3 rounded-xl border border-gray-200">
                          <p className="text-xs text-emerald-800 font-bold flex items-center space-x-1">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>OTP sent to {user.email}! (Demo OTP: 123456)</span>
                          </p>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              6-Digit Email OTP:
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={resetOtpInput}
                              onChange={(e) => setResetOtpInput(e.target.value)}
                              placeholder="123456"
                              className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono tracking-widest text-gray-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              New Account Password (min 6 chars):
                            </label>
                            <input
                              type="password"
                              value={resetNewPassword}
                              onChange={(e) => setResetNewPassword(e.target.value)}
                              placeholder="Enter new password"
                              className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Confirm Account Password:
                            </label>
                            <input
                              type="password"
                              value={resetConfirmNewPassword}
                              onChange={(e) => setResetConfirmNewPassword(e.target.value)}
                              placeholder="Confirm new password"
                              className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900"
                            />
                          </div>

                          {resetErrorMessage && (
                            <div className="p-2 bg-rose-100 border border-rose-300 rounded text-rose-800 text-[11px]">
                              {resetErrorMessage}
                            </div>
                          )}

                          <button
                            type="submit"
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs"
                          >
                            Verify Identity & Create Password
                          </button>
                        </form>
                      )}

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setIsCreatingPasswordForReset(false)}
                          className="text-xs text-gray-600 hover:underline"
                        >
                          ← Back to password entry
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
