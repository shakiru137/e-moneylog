import React, { useState, useEffect, lazy, Suspense } from 'react';
import { LogEntry, DebtEntry, UserProfile, LedgerType, AuditLogEntry } from './types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_LOGS,
  INITIAL_DEBTS,
  formatNaira,
  speakText,
  CATEGORIES,
  getUserKey,
  saveUserProfileToStore,
  fetchUserProfileFromStore,
} from './utils/formatters';
import { Navbar } from './components/Navbar';
import { DebtLedger } from './components/DebtLedger';
import { WhatsAppBotSimulator } from './components/WhatsAppBotSimulator';
import { AIAdvisorWidget } from './components/AIAdvisorWidget';
import { ReportsExport } from './components/ReportsExport';
import { AuthModal } from './components/AuthModal';

const VoiceLogModal = lazy(() => import('./components/VoiceLogModal').then(m => ({ default: m.VoiceLogModal })));
const SMSAutoLoggerModal = lazy(() => import('./components/SMSAutoLoggerModal').then(m => ({ default: m.SMSAutoLoggerModal })));
const AddLogModal = lazy(() => import('./components/AddLogModal').then(m => ({ default: m.AddLogModal })));
const ProfileModal = lazy(() => import('./components/ProfileModal').then(m => ({ default: m.ProfileModal })));
const VideoDemoModal = lazy(() => import('./components/VideoDemoModal').then(m => ({ default: m.VideoDemoModal })));

import {
  Wallet,
  Mic,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Plus,
  Search,
  Trash2,
  Volume2,
  Building2,
  Users,
  UserCheck,
  Smartphone,
  MessageSquare,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Play,
} from 'lucide-react';

export default function App() {
  // State initialization with localStorage persistence
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('emoneylog_user');
      return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('emoneylog_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [debts, setDebts] = useState<DebtEntry[]>(() => {
    try {
      const saved = localStorage.getItem('emoneylog_debts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeLedger, setActiveLedger] = useState<LedgerType>('business');
  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'debts' | 'ai-voice' | 'advisor' | 'reports'>('dashboard');

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isVideoDemoOpen, setIsVideoDemoOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Search & Filter in Dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');

  // User Authentication & Data Switcher
  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const updatedUser = { ...prev, ...updated };
      const userKey = getUserKey(updatedUser);
      try {
        localStorage.setItem('emoneylog_user', JSON.stringify(updatedUser));
        localStorage.setItem(`emoneylog_user_${userKey}`, JSON.stringify(updatedUser));
      } catch (e) {
        console.warn('LocalStorage error on user update:', e);
      }
      saveUserProfileToStore(userKey, updatedUser);
      return updatedUser;
    });
  };

  const handleLoginSuccess = async (userData: Partial<UserProfile>) => {
    const userKey = getUserKey(userData);
    const isDemoUser = userKey.includes('usr-nigeria-01') || userKey.includes('amina');
    
    // 1. Retrieve saved profile from LocalStorage or Server Store
    let savedProfile: Partial<UserProfile> | null = null;
    try {
      const savedRaw = localStorage.getItem(`emoneylog_user_${userKey}`);
      if (savedRaw) {
        savedProfile = JSON.parse(savedRaw);
      }
    } catch {
      // ignore
    }

    try {
      const remoteProfile = await fetchUserProfileFromStore(userKey);
      if (remoteProfile) {
        savedProfile = { ...(savedProfile || {}), ...remoteProfile };
      }
    } catch {
      // ignore
    }

    const defaultAvatar = userData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
    const fullProfile: UserProfile = savedProfile ? {
      ...INITIAL_USER_PROFILE,
      ...savedProfile,
      id: userKey,
      fullName: savedProfile.fullName || userData.fullName || userKey.split('@')[0],
      email: savedProfile.email || userData.email || userKey,
      phone: savedProfile.phone || userData.phone || '',
      businessName: savedProfile.businessName || userData.businessName || '',
      avatarUrl: savedProfile.avatarUrl || defaultAvatar,
      hasPassword: savedProfile.hasPassword ?? userData.hasPassword ?? true,
      authProvider: savedProfile.authProvider || userData.authProvider || 'email',
    } as UserProfile : {
      ...INITIAL_USER_PROFILE,
      id: userKey,
      fullName: userData.fullName || userKey.split('@')[0],
      email: userData.email || userKey,
      phone: userData.phone || '',
      businessName: userData.businessName || '',
      avatarUrl: defaultAvatar,
      hasPassword: userData.hasPassword ?? true,
      authProvider: userData.authProvider || 'email',
    };

    setUser(fullProfile);
    try {
      localStorage.setItem('emoneylog_user', JSON.stringify(fullProfile));
      localStorage.setItem(`emoneylog_user_${userKey}`, JSON.stringify(fullProfile));
    } catch (e) {
      console.warn('LocalStorage error on login:', e);
    }
    saveUserProfileToStore(userKey, fullProfile);

    // 2. Load user-specific isolated logs
    const savedUserLogs = localStorage.getItem(`emoneylog_logs_${userKey}`);
    let userLogs: LogEntry[] = [];
    if (savedUserLogs) {
      userLogs = JSON.parse(savedUserLogs);
    } else if (isDemoUser) {
      userLogs = INITIAL_LOGS.map((l) => ({ ...l, userId: userKey }));
    } else {
      userLogs = [];
    }
    setLogs(userLogs);
    try {
      localStorage.setItem('emoneylog_logs', JSON.stringify(userLogs));
      localStorage.setItem(`emoneylog_logs_${userKey}`, JSON.stringify(userLogs));
    } catch (e) {
      console.warn('LocalStorage error on logs:', e);
    }

    // 3. Load user-specific isolated debts
    const savedUserDebts = localStorage.getItem(`emoneylog_debts_${userKey}`);
    let userDebts: DebtEntry[] = [];
    if (savedUserDebts) {
      userDebts = JSON.parse(savedUserDebts);
    } else if (isDemoUser) {
      userDebts = INITIAL_DEBTS.map((d) => ({ ...d, userId: userKey }));
    } else {
      userDebts = [];
    }
    setDebts(userDebts);
    try {
      localStorage.setItem('emoneylog_debts', JSON.stringify(userDebts));
      localStorage.setItem(`emoneylog_debts_${userKey}`, JSON.stringify(userDebts));
    } catch (e) {
      console.warn('LocalStorage error on debts:', e);
    }

    setIsLoggedIn(true);
    localStorage.setItem('emoneylog_logged_in', 'true');
    localStorage.setItem('emoneylog_active_user_key', userKey);
    setIsAuthOpen(false);
  };

  const handleResetAllRecords = (auditEntry?: AuditLogEntry) => {
    const userKey = getUserKey(user);
    setLogs([]);
    setDebts([]);
    localStorage.setItem('emoneylog_logs', JSON.stringify([]));
    localStorage.setItem('emoneylog_debts', JSON.stringify([]));
    if (userKey) {
      localStorage.setItem(`emoneylog_logs_${userKey}`, JSON.stringify([]));
      localStorage.setItem(`emoneylog_debts_${userKey}`, JSON.stringify([]));
    }

    if (auditEntry) {
      const existingAudit = user.auditLogs || [];
      const updatedAudit = [auditEntry, ...existingAudit];
      const updatedUser = { ...user, auditLogs: updatedAudit };
      setUser(updatedUser);
      handleUpdateUser({ auditLogs: updatedAudit });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(true);
    localStorage.setItem('emoneylog_logged_in', 'true');
    localStorage.removeItem('emoneylog_active_user_key');
    localStorage.removeItem('emoneylog_user');
    setUser(INITIAL_USER_PROFILE);
    setIsProfileOpen(false);
    setIsVoiceModalOpen(false);
    setIsSMSModalOpen(false);
    setIsAddModalOpen(false);
    setIsVideoDemoOpen(false);
  };

  // Save to LocalStorage and server store for active user
  useEffect(() => {
    if (isLoggedIn && user) {
      const userKey = getUserKey(user);
      try {
        localStorage.setItem('emoneylog_user', JSON.stringify(user));
        localStorage.setItem(`emoneylog_user_${userKey}`, JSON.stringify(user));
      } catch (e) {
        console.warn('LocalStorage save failed in useEffect:', e);
      }
      saveUserProfileToStore(userKey, user);
    }
  }, [user, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('emoneylog_logs', JSON.stringify(logs));
      const userKey = getUserKey(user);
      if (userKey) {
        localStorage.setItem(`emoneylog_logs_${userKey}`, JSON.stringify(logs));
      }
    }
  }, [logs, user, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('emoneylog_debts', JSON.stringify(debts));
      const userKey = getUserKey(user);
      if (userKey) {
        localStorage.setItem(`emoneylog_debts_${userKey}`, JSON.stringify(debts));
      }
    }
  }, [debts, user, isLoggedIn]);

  // Log Management
  const handleAddLog = (newLog: Omit<LogEntry, 'id' | 'userId'>) => {
    const created: LogEntry = {
      ...newLog,
      id: `log-${Date.now()}`,
      userId: user.id,
    };
    setLogs((prev) => [created, ...prev]);
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  // Debt Management
  const handleAddDebt = (newDebt: Omit<DebtEntry, 'id' | 'userId' | 'createdAt' | 'whatsappReminderCount'>) => {
    const created: DebtEntry = {
      ...newDebt,
      id: `debt-${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString().split('T')[0],
      whatsappReminderCount: 0,
    };
    setDebts((prev) => [created, ...prev]);
  };

  const handleUpdateDebtPayment = (id: string, additionalAmount: number) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const newPaid = d.paidAmount + additionalAmount;
        const isFullyPaid = newPaid >= d.amount;
        return {
          ...d,
          paidAmount: Math.min(d.amount, newPaid),
          status: isFullyPaid ? 'paid' : newPaid > 0 ? 'partially_paid' : 'pending',
        };
      })
    );
  };

  const handleDeleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  // Calculations for Active Ledger
  const currentLogs = logs.filter((l) => l.ledgerType === activeLedger);

  const totalCashIn = currentLogs
    .filter((l) => l.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalCashOut = currentLogs
    .filter((l) => l.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentBalance = totalCashIn - totalCashOut;

  const totalDebtsOwedToMe = debts
    .filter((d) => d.ledgerType === activeLedger && d.type === 'debtor' && d.status !== 'paid')
    .reduce((acc, curr) => acc + (curr.amount - curr.paidAmount), 0);

  // Filtered Logs
  const filteredLogs = currentLogs.filter((log) => {
    const matchesQuery =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || log.category === selectedCategory;
    const matchesType = selectedType === 'all' || log.type === selectedType;

    return matchesQuery && matchesCategory && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#F1F3F5] text-gray-800 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navigation Header */}
      <Navbar
        activeLedger={activeLedger}
        onSelectLedger={(l) => setActiveLedger(l)}
        user={user}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSMSModal={() => setIsSMSModalOpen(true)}
        onOpenVideoDemo={() => setIsVideoDemoOpen(true)}
        isLoggedIn={isLoggedIn}
        onLockApp={() => setIsLocked(true)}
      />

      {/* PIN Security Lock Screen */}
      {isLocked && (
        <AuthModal
          isOpen={true}
          onClose={() => setIsLocked(false)}
          onLoginSuccess={() => {}}
          isPinLockMode={true}
          expectedPin={user.pin}
          onUnlockPin={() => setIsLocked(false)}
        />
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Main Navigation Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-1.5 shadow-xs flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center space-x-1 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setActiveMainTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeMainTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Cash Book</span>
            </button>

            <button
              onClick={() => setActiveMainTab('debts')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeMainTab === 'debts'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Debts & Creditors ("Owo")</span>
            </button>

            <button
              onClick={() => setActiveMainTab('ai-voice')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeMainTab === 'ai-voice'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>AI Voice & WhatsApp Bot</span>
            </button>

            <button
              onClick={() => setActiveMainTab('advisor')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeMainTab === 'advisor'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Oga Financial Advisor</span>
            </button>

            <button
              onClick={() => setActiveMainTab('reports')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeMainTab === 'reports'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Reports & Export</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD CASH BOOK */}
        {activeMainTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* 60s Video Guide Banner */}
            <div className="bg-gradient-to-r from-gray-900 via-[#1A1C1E] to-emerald-950 text-white rounded-xl p-3.5 sm:p-4 border border-gray-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <Play className="w-5 h-5 fill-rose-400" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-2">
                    <span>How to Use E-moneyLog in 60 Seconds</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 rounded">Video Guide</span>
                  </h4>
                  <p className="text-[11px] text-gray-300">
                    Watch the official video walkthrough showing AI Voice logging, SMS alert parsing, and Gbese debt tracking.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVideoDemoOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition-all shrink-0 flex items-center justify-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Watch Video Guide (60s)</span>
              </button>
            </div>

            {/* Cash Summary Cards Banner (High Density Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Balance */}
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <span>Net Cash Balance ({activeLedger})</span>
                  <Wallet className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className={`text-2xl sm:text-3xl font-black ${currentBalance >= 0 ? 'text-gray-900' : 'text-rose-600'}`}>
                  {formatNaira(currentBalance)}
                </h3>
                <p className="text-[11px] text-emerald-600 mt-2 font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Naira Base (NGN) • Real-time</span>
                </p>
              </div>

              {/* Total Cash In (Income) */}
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-600 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <span>Total Cash In</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">
                  {formatNaira(totalCashIn)}
                </h3>
                <p className="text-[11px] text-gray-500 mt-2">
                  {currentLogs.filter((l) => l.type === 'income').length} income transaction(s)
                </p>
              </div>

              {/* Total Cash Out (Expense) */}
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-rose-600 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <span>Total Cash Out</span>
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">
                  {formatNaira(totalCashOut)}
                </h3>
                <p className="text-[11px] text-gray-500 mt-2">
                  {currentLogs.filter((l) => l.type === 'expense').length} expense transaction(s)
                </p>
              </div>

              {/* Money Owed to You */}
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-amber-600 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <span>Uncollected Debts ("Owo")</span>
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">
                  {formatNaira(totalDebtsOwedToMe)}
                </h3>
                <button
                  onClick={() => setActiveMainTab('debts')}
                  className="text-[11px] text-emerald-600 font-bold hover:underline mt-2 inline-block text-left"
                >
                  Manage Debtors & Reminders →
                </button>
              </div>

            </div>

            {/* Quick AI Voice Action Banner (High Density Dark Accent Dock) */}
            <div className="p-4 bg-[#1A1C1E] text-white rounded-xl border border-gray-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-center sm:text-left">
                <div className="p-2.5 bg-emerald-500/20 rounded-lg text-emerald-400 border border-emerald-500/30">
                  <Mic className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Speak to Log Cash Transactions
                  </h4>
                  <p className="text-xs text-gray-400">
                    Say e.g. <span className="text-amber-300 font-medium">"Spent 500 for bread"</span> or <span className="text-emerald-300 font-medium">"Client pay me 20k for fabric"</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-md shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Open AI Voice Log</span>
                </button>
                <button
                  onClick={() => setIsSMSModalOpen(true)}
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-white/10 hover:bg-white/15 text-amber-300 border border-gray-700 font-semibold text-xs rounded-md transition-colors"
                >
                  Bank SMS Parser
                </button>
              </div>
            </div>

            {/* Cash Transactions Table Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-4 space-y-4">
              
              {/* Header Controls */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-gray-900 flex items-center space-x-2">
                    <span>Cash Log History</span>
                    <span className="text-xs font-normal text-gray-500">
                      ({filteredLogs.length} entries)
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Showing entries for <span className="font-bold text-emerald-600 capitalize">{activeLedger} Book</span>
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  
                  {/* Search */}
                  <div className="relative flex-1 md:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search log..."
                      className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  {/* Type Filter */}
                  <select
                    value={selectedType}
                    onChange={(e: any) => setSelectedType(e.target.value)}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Types</option>
                    <option value="income">Cash In (Income)</option>
                    <option value="expense">Cash Out (Expense)</option>
                  </select>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                </div>
              </div>

              {/* Transactions List */}
              {filteredLogs.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">No cash entries recorded yet</p>
                    <p className="text-gray-500 max-w-sm mx-auto mt-0.5">
                      All balances and transaction counters are currently at <span className="font-bold text-gray-900">₦0</span> for your account.
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-2 pt-1">
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add First Transaction</span>
                    </button>
                    <button
                      onClick={() => {
                        setLogs(INITIAL_LOGS);
                        setDebts(INITIAL_DEBTS);
                      }}
                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-md transition-colors"
                    >
                      Load Sample Demo Data
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-gray-200">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Description / AI Correction</th>
                        <th className="p-3">Source</th>
                        <th className="p-3 text-right">Amount (₦)</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="p-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                            {log.date}
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-gray-900 block">
                              {log.category}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="font-medium text-gray-800">
                              {log.correctedPhrase || log.description}
                            </p>
                            {log.rawVoiceTranscript && (
                              <p className="text-[10px] text-gray-400 italic">
                                Voice: "{log.rawVoiceTranscript}"
                              </p>
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                log.source === 'voice'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : log.source === 'sms'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : log.source === 'whatsapp'
                                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                            >
                              {log.source}
                            </span>
                          </td>
                          <td className="p-3 text-right font-extrabold text-sm whitespace-nowrap">
                            <span
                              className={log.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}
                            >
                              {log.type === 'income' ? '+' : '-'} {formatNaira(log.amount)}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => speakText(log.correctedPhrase || log.description)}
                                className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors"
                                title="Listen to entry"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteLog(log.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors"
                                title="Delete log"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 2: DEBTS & CREDITORS ("OWO") */}
        {activeMainTab === 'debts' && (
          <DebtLedger
            debts={debts}
            activeLedger={activeLedger}
            user={user}
            onAddDebt={handleAddDebt}
            onUpdatePayment={handleUpdateDebtPayment}
            onDeleteDebt={handleDeleteDebt}
          />
        )}

        {/* TAB 3: AI VOICE & WHATSAPP BOT */}
        {activeMainTab === 'ai-voice' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Voice Recorder Card */}
            <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-xs space-y-4">
              <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">AI Voice Cash Book Engine</h3>
                  <p className="text-xs text-gray-500">
                    Pronunciation correction tailored for Nigerian English & Pidgin
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Tap below to test instant AI voice recognition and pronunciation error correction. E-moneyLog automatically fixes accent slips like "five handred" to ₦500 and "two k" to ₦2,000 NGN.
              </p>

              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md shadow-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Launch Voice Recorder</span>
              </button>
            </div>

            {/* WhatsApp Bot Simulator */}
            <WhatsAppBotSimulator activeLedger={activeLedger} onAddLog={handleAddLog} />

          </div>
        )}

        {/* TAB 4: OGA AI FINANCIAL ADVISOR */}
        {activeMainTab === 'advisor' && (
          <AIAdvisorWidget
            logs={logs}
            debts={debts}
            user={user}
            activeLedger={activeLedger}
          />
        )}

        {/* TAB 5: REPORTS & STATEMENT EXPORT */}
        {activeMainTab === 'reports' && (
          <ReportsExport logs={logs} activeLedger={activeLedger} user={user} />
        )}

      </main>

      {/* ALL MODALS */}
      <Suspense fallback={null}>
        <VoiceLogModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          activeLedger={activeLedger}
          onAddLog={handleAddLog}
          isVoiceFeedbackEnabled={user.isVoiceFeedbackEnabled}
        />

        <SMSAutoLoggerModal
          isOpen={isSMSModalOpen}
          onClose={() => setIsSMSModalOpen(false)}
          activeLedger={activeLedger}
          onAddLog={handleAddLog}
        />

        <AddLogModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          activeLedger={activeLedger}
          onAddLog={handleAddLog}
        />

        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onResetAllRecords={handleResetAllRecords}
        />

        <VideoDemoModal
          isOpen={isVideoDemoOpen}
          onClose={() => setIsVideoDemoOpen(false)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenSMSModal={() => setIsSMSModalOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      </Suspense>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );

}
