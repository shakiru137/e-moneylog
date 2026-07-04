import { CategoryItem, BankSMSPreset, LogEntry, DebtEntry, UserProfile, BudgetConfig } from '../types';

// Format Naira helper
export function formatNaira(amount: number, showDecimals: boolean = false): string {
  const formatted = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
  return `₦${formatted}`;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'Food & Dining', iconName: 'Utensils', type: 'expense', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200' },
  { id: 'cat-2', name: 'Transportation', iconName: 'Car', type: 'expense', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200' },
  { id: 'cat-3', name: 'Business Stock', iconName: 'ShoppingBag', type: 'expense', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200' },
  { id: 'cat-4', name: 'Utilities & Bills', iconName: 'Zap', type: 'expense', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200' },
  { id: 'cat-5', name: 'Salaries & Wages', iconName: 'Briefcase', type: 'both', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200' },
  { id: 'cat-6', name: 'Personal & Shopping', iconName: 'UserCheck', type: 'expense', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200' },
  { id: 'cat-7', name: 'Gifts & Donations', iconName: 'HeartHandshake', type: 'expense', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200' },
  { id: 'cat-8', name: 'Sales Revenue', iconName: 'TrendingUp', type: 'income', color: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border-emerald-300' },
  { id: 'cat-9', name: 'Client Payment', iconName: 'CreditCard', type: 'income', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200' },
  { id: 'cat-10', name: 'General', iconName: 'Layers', type: 'both', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200' },
];

export const SAMPLE_SMS_PRESETS: BankSMSPreset[] = [
  {
    id: 'sms-gtb',
    bankName: 'GTBank',
    sampleSms: 'Acct: **2341 Amt: NGN12,500.00 DR Desc: POS/CHICKEN REPUBLIC IKEJA Date: 03-JUL-2026 14:22 Bal: NGN145,200.50',
    logoColor: 'bg-orange-600',
  },
  {
    id: 'sms-opay',
    bankName: 'OPay',
    sampleSms: 'Transfer Successful! You sent NGN 50,000.00 to BABAJIDE TRADING STORE for Wholesale Goods. Transaction ID: OP8829104',
    logoColor: 'bg-emerald-600',
  },
  {
    id: 'sms-kuda',
    bankName: 'Kuda Bank',
    sampleSms: 'You received ₦85,000.00 from ADEBAYO CONSULTING LLC. Ref: Website Design Project Payment. Available Bal: ₦220,400.00',
    logoColor: 'bg-purple-600',
  },
  {
    id: 'sms-zenith',
    bankName: 'Zenith Bank',
    sampleSms: 'Txn: Debit Amt: NGN 18,200.00 Acc: 208****192 Desc: E-Tranzact Airtime & Data Topup Date: 03/07/2026 10:15',
    logoColor: 'bg-red-600',
  },
  {
    id: 'sms-access',
    bankName: 'Access Bank',
    sampleSms: 'Credit Alert! NGN 120,000.00 credited to acc 004***991 by MINISTRY OF WORKS - Monthly Contractor Retainer',
    logoColor: 'bg-blue-600',
  },
];

export const INITIAL_USER_PROFILE: UserProfile = {
  id: '',
  fullName: '',
  email: '',
  phone: '',
  businessName: '',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  state: 'Lagos',
  city: 'Ikeja',
  currency: 'NGN',
  pin: '1234',
  isBiometricsEnabled: false,
  isVoiceFeedbackEnabled: true,
  preferredLanguage: 'English',
  hasPassword: false,
  authProvider: 'email',
};

export const INITIAL_LOGS: LogEntry[] = [];

export const INITIAL_DEBTS: DebtEntry[] = [];

export const INITIAL_BUDGETS: BudgetConfig[] = [
  { id: 'bgt-1', category: 'Food & Dining', monthlyLimit: 60000, alertThresholdPercent: 80 },
  { id: 'bgt-2', category: 'Transportation', monthlyLimit: 40000, alertThresholdPercent: 75 },
  { id: 'bgt-3', category: 'Utilities & Bills', monthlyLimit: 30000, alertThresholdPercent: 80 },
  { id: 'bgt-4', category: 'Business Stock', monthlyLimit: 250000, alertThresholdPercent: 90 },
];

// Helper to construct pre-filled WhatsApp link for Debtors
export function createWhatsAppReminderLink(debt: DebtEntry, user: UserProfile): string {
  const remaining = debt.amount - debt.paidAmount;
  const message = `Hello ${debt.personName}, this is a friendly reminder from ${user.businessName || user.fullName} regarding the outstanding balance of ${formatNaira(remaining)} for "${debt.description}". Due date: ${debt.dueDate}. Kindly make payment when convenient. Thank you! (Sent via E-moneyLog)`;
  
  const cleanPhone = debt.personPhone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// Speak text using Web Speech API
export function speakText(text: string, language: string = 'en-NG') {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); // Stop ongoing speech
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language || 'en-NG';
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  // Try to pick English voice if available
  const voices = window.speechSynthesis.getVoices();
  const ngVoice = voices.find(v => v.lang.includes('NG') || v.name.includes('Nigeria') || v.lang.includes('en'));
  if (ngVoice) {
    utterance.voice = ngVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// User Key Normalization Helper
export function getUserKey(data?: Partial<UserProfile> | string | null): string {
  if (!data) return 'usr_default';
  if (typeof data === 'string') {
    return data.trim().toLowerCase();
  }
  if (data.email && data.email.trim()) {
    return data.email.trim().toLowerCase();
  }
  if (data.phone && data.phone.trim()) {
    return data.phone.replace(/\D/g, '');
  }
  if (data.id && data.id.trim()) {
    return data.id.trim().toLowerCase();
  }
  if (data.fullName && data.fullName.trim()) {
    return data.fullName.trim().toLowerCase().replace(/\s+/g, '_');
  }
  return 'usr_default';
}

// Canvas-based Profile Photo Resizer/Compressor to guarantee localStorage & API fit
export function compressImage(
  file: File,
  maxWidth = 300,
  maxHeight = 300,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => resolve(event.target?.result as string);
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Sync user profile to server database API and localStorage
export async function saveUserProfileToStore(userKey: string, profile: Partial<UserProfile>): Promise<void> {
  const key = getUserKey(userKey || profile.email || profile.id);
  if (!key) return;

  // 1. LocalStorage save with try/catch
  try {
    localStorage.setItem(`emoneylog_user_${key}`, JSON.stringify(profile));
    localStorage.setItem('emoneylog_user', JSON.stringify(profile));
  } catch (e) {
    console.warn('LocalStorage save warning:', e);
  }

  // 2. Server API sync
  try {
    await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userKey: key, profile }),
    });
  } catch (err) {
    console.warn('Server user profile API sync notice:', err);
  }
}

// Retrieve user profile from server API or localStorage
export async function fetchUserProfileFromStore(userKey: string): Promise<Partial<UserProfile> | null> {
  const key = getUserKey(userKey);
  if (!key) return null;

  // 1. Try server endpoint
  try {
    const res = await fetch(`/api/user/profile?userKey=${encodeURIComponent(key)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.profile) {
        return data.profile;
      }
    }
  } catch {
    // fallback
  }

  // 2. Try localStorage
  try {
    const saved = localStorage.getItem(`emoneylog_user_${key}`);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return null;
}

