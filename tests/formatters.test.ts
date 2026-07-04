import { describe, it, expect } from 'vitest';
import { formatNaira, getUserKey, createWhatsAppReminderLink, INITIAL_USER_PROFILE } from '../src/utils/formatters';
import { DebtEntry } from '../src/types';

describe('Formatters & Utility Helpers Unit Tests', () => {
  it('should format numbers into Naira currency strings', () => {
    expect(formatNaira(5000)).toBe('₦5,000');
    expect(formatNaira(1250000)).toBe('₦1,250,000');
    expect(formatNaira(0)).toBe('₦0');
    expect(formatNaira(500.5, true)).toBe('₦500.50');
  });

  it('should generate consistent normalized user keys', () => {
    expect(getUserKey('Amina.B@emoneylog.ng ')).toBe('amina.b@emoneylog.ng');
    expect(getUserKey({ email: 'USER@EXAMPLE.COM ' })).toBe('user@example.com');
    expect(getUserKey({ phone: '+234 803-456-7890' })).toBe('2348034567890');
    expect(getUserKey({ fullName: 'Yusuf Shakiru' })).toBe('yusuf_shakiru');
    expect(getUserKey(null)).toBe('usr_default');
  });

  it('should generate valid WhatsApp payment reminder links', () => {
    const debt: DebtEntry = {
      id: 'debt-test',
      userId: 'usr-1',
      personName: 'Chief Emeka',
      personPhone: '+234 802 111 2233',
      amount: 35000,
      paidAmount: 10000,
      type: 'debtor',
      description: 'Lace Material',
      dueDate: '2026-07-10',
      status: 'partially_paid',
      ledgerType: 'business',
      whatsappReminderCount: 1,
      createdAt: '2026-06-25',
    };

    const link = createWhatsAppReminderLink(debt, INITIAL_USER_PROFILE);
    expect(link.startsWith('https://wa.me/2348021112233?text=')).toBe(true);
    expect(link).toContain('Chief%20Emeka');
    expect(link).toContain('%E2%82%A625%2C000'); // encoded ₦25,000
  });
});
