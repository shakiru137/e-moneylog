import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export interface DBUser {
  id: string;
  email: string;
  fullName: string;
  businessName: string;
  passwordHash: string;
  isVerified: boolean;
  authProvider: string;
  avatarUrl?: string;
  phone?: string;
  state?: string;
  currency?: string;
  createdAt: string;
}

export interface DBLog {
  id: string;
  userId: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  description: string;
  source: "manual" | "voice" | "sms" | "whatsapp" | "import";
  ledgerType: string;
  date: string;
  rawVoiceTranscript?: string;
  correctedPhrase?: string;
  bankName?: string;
  createdAt: string;
}

export interface DBDebt {
  id: string;
  userId: string;
  personName: string;
  personPhone?: string;
  amount: number;
  paidAmount: number;
  type: "i_owe" | "they_owe";
  description?: string;
  dueDate?: string;
  status: "pending" | "partially_paid" | "cleared";
  ledgerType?: string;
  createdAt: string;
}

export interface DBAuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  verifiedOnServer: boolean;
  createdAt: string;
}

export interface DBOTP {
  email: string;
  codeHash: string;
  expiresAt: number;
  purpose: string;
}

interface DBSchema {
  users: Record<string, DBUser>;
  logs: DBLog[];
  debts: DBDebt[];
  auditLogs: DBAuditLog[];
  otps: Record<string, DBOTP>;
}

class Database {
  private data: DBSchema = {
    users: {},
    logs: [],
    debts: [],
    auditLogs: [],
    otps: {},
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (err) {
      console.error("[DB INIT ERROR] Using in-memory fallback:", err);
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("[DB SAVE ERROR]:", err);
    }
  }

  // --- USER OPERATIONS ---
  public getUser(email: string): DBUser | undefined {
    return this.data.users[email.trim().toLowerCase()];
  }

  public setUser(user: DBUser): DBUser {
    const key = user.email.trim().toLowerCase();
    this.data.users[key] = { ...user, email: key };
    this.save();
    return this.data.users[key];
  }

  public getAllUsers(): DBUser[] {
    return Object.values(this.data.users);
  }

  // --- LOG OPERATIONS ---
  public getLogs(userId: string): DBLog[] {
    return this.data.logs
      .filter((l) => l.userId.toLowerCase() === userId.toLowerCase())
      .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
  }

  public createLog(log: DBLog): DBLog {
    this.data.logs.unshift(log);
    this.save();
    return log;
  }

  public deleteLog(id: string, userId: string): boolean {
    const initialLen = this.data.logs.length;
    this.data.logs = this.data.logs.filter(
      (l) => !(l.id === id && l.userId.toLowerCase() === userId.toLowerCase())
    );
    const deleted = this.data.logs.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  public clearUserLogs(userId: string): void {
    this.data.logs = this.data.logs.filter(
      (l) => l.userId.toLowerCase() !== userId.toLowerCase()
    );
    this.save();
  }

  // --- DEBT OPERATIONS ---
  public getDebts(userId: string): DBDebt[] {
    return this.data.debts
      .filter((d) => d.userId.toLowerCase() === userId.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createDebt(debt: DBDebt): DBDebt {
    this.data.debts.unshift(debt);
    this.save();
    return debt;
  }

  public updateDebt(id: string, userId: string, updates: Partial<DBDebt>): DBDebt | null {
    const debt = this.data.debts.find(
      (d) => d.id === id && d.userId.toLowerCase() === userId.toLowerCase()
    );
    if (!debt) return null;
    Object.assign(debt, updates);
    this.save();
    return debt;
  }

  public deleteDebt(id: string, userId: string): boolean {
    const initialLen = this.data.debts.length;
    this.data.debts = this.data.debts.filter(
      (d) => !(d.id === id && d.userId.toLowerCase() === userId.toLowerCase())
    );
    const deleted = this.data.debts.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  public clearUserDebts(userId: string): void {
    this.data.debts = this.data.debts.filter(
      (d) => d.userId.toLowerCase() !== userId.toLowerCase()
    );
    this.save();
  }

  // --- AUDIT LOGS ---
  public addAuditLog(entry: DBAuditLog): DBAuditLog {
    this.data.auditLogs.unshift(entry);
    this.save();
    return entry;
  }

  public getAuditLogs(userId: string): DBAuditLog[] {
    return this.data.auditLogs.filter((a) => a.userId.toLowerCase() === userId.toLowerCase());
  }

  // --- OTP STORE ---
  public setOTP(otp: DBOTP): void {
    this.data.otps[otp.email.toLowerCase()] = otp;
    this.save();
  }

  public getOTP(email: string): DBOTP | undefined {
    const otp = this.data.otps[email.toLowerCase()];
    if (!otp) return undefined;
    if (Date.now() > otp.expiresAt) {
      delete this.data.otps[email.toLowerCase()];
      this.save();
      return undefined;
    }
    return otp;
  }

  public clearOTP(email: string): void {
    delete this.data.otps[email.toLowerCase()];
    this.save();
  }
}

export const db = new Database();
