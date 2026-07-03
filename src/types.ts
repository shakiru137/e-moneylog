export type LedgerType = 'personal' | 'business' | 'joint';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  avatarUrl: string;
  state: string;
  city: string;
  currency: string; // "NGN"
  pin: string;
  isBiometricsEnabled: boolean;
  isVoiceFeedbackEnabled: boolean;
  preferredLanguage: 'English' | 'Pidgin' | 'Yoruba' | 'Igbo' | 'Hausa';
}

export interface LogEntry {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  source: 'voice' | 'manual' | 'sms' | 'whatsapp';
  ledgerType: LedgerType;
  date: string; // ISO string or YYYY-MM-DD
  rawVoiceTranscript?: string;
  correctedPhrase?: string;
  bankName?: string;
}

export interface DebtEntry {
  id: string;
  userId: string;
  personName: string;
  personPhone: string;
  amount: number;
  paidAmount: number;
  type: 'debtor' | 'creditor'; // debtor = owes me money ("Owo Debt"); creditor = I owe money
  description: string;
  dueDate: string;
  status: 'pending' | 'partially_paid' | 'paid';
  ledgerType: LedgerType;
  whatsappReminderCount: number;
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  iconName: string;
  type: 'income' | 'expense' | 'both';
  color: string;
}

export interface BudgetConfig {
  id: string;
  category: string;
  monthlyLimit: number;
  alertThresholdPercent: number; // e.g., 80%
}

export interface BankSMSPreset {
  id: string;
  bankName: string;
  sampleSms: string;
  logoColor: string;
}

export interface AIAdvisorData {
  summaryText: string;
  topExpenseCategory: string;
  savingsTip: string;
  healthScore: number;
  pidginGreeting: string;
}

export interface JointMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  phone: string;
}
