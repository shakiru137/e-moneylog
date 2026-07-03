import React, { useState } from 'react';
import { LogEntry, LedgerType } from '../types';
import { SAMPLE_SMS_PRESETS, formatNaira } from '../utils/formatters';
import { X, Sparkles, Check, ArrowRight, RefreshCw, Smartphone, Copy } from 'lucide-react';

interface SMSAutoLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLedger: LedgerType;
  onAddLog: (log: Omit<LogEntry, 'id' | 'userId'>) => void;
}

export const SMSAutoLoggerModal: React.FC<SMSAutoLoggerModalProps> = ({
  isOpen,
  onClose,
  activeLedger,
  onAddLog,
}) => {
  const [smsText, setSmsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<{
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
    bankName: string;
    corrected_phrase: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParseSMS = async (textToParse: string) => {
    if (!textToParse.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/sms-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smsText: textToParse }),
      });

      if (!res.ok) throw new Error('Failed to parse bank SMS');

      const data = await res.json();
      setParsedResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing SMS');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!parsedResult) return;

    onAddLog({
      amount: parsedResult.amount || 0,
      type: parsedResult.type || 'expense',
      category: parsedResult.category || 'General',
      description: parsedResult.description || 'Bank SMS Transaction',
      source: 'sms',
      ledgerType: activeLedger,
      date: new Date().toISOString().split('T')[0],
      bankName: parsedResult.bankName,
      correctedPhrase: parsedResult.corrected_phrase,
    });

    setSmsText('');
    setParsedResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden text-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Bank SMS Alert Auto-Logger</h3>
              <p className="text-xs text-gray-500">
                AI parses Nigerian Bank Alerts (GTB, Zenith, Kuda, OPay, Moniepoint)
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

        {/* Body */}
        <div className="p-5 space-y-4">
          
          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Select Sample Bank Alert SMS to test:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SAMPLE_SMS_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSmsText(preset.sampleSms);
                    handleParseSMS(preset.sampleSms);
                  }}
                  className="p-2 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-lg text-left text-xs transition-colors group"
                >
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${preset.logoColor}`}></span>
                    <span className="font-bold text-gray-800 group-hover:text-emerald-700">
                      {preset.bankName}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-1">
                    {preset.sampleSms}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* SMS Textarea */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Paste SMS Alert Text Here:
            </label>
            <textarea
              rows={3}
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="e.g. Acct: **2341 Amt: NGN12,500.00 DR Desc: POS/CHICKEN REPUBLIC..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none font-mono"
            />
          </div>

          {/* Parse Button */}
          <button
            onClick={() => handleParseSMS(smsText)}
            disabled={isLoading || !smsText.trim()}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Parse Bank SMS with AI</span>
              </>
            )}
          </button>

          {/* Error */}
          {errorMsg && (
            <p className="text-xs text-rose-700 p-2.5 bg-rose-50 border border-rose-200 rounded-md">
              {errorMsg}
            </p>
          )}

          {/* Result Card */}
          {parsedResult && (
            <div className="p-4 bg-gray-50 border border-emerald-300 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 flex items-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>Parsed {parsedResult.bankName || 'Bank'} Transaction</span>
                </span>
                <span className="text-[11px] text-gray-500">
                  {parsedResult.type.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 block">Amount</span>
                  <span className="font-extrabold text-gray-900 text-base">
                    {formatNaira(parsedResult.amount)}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 block">Category</span>
                  <span className="font-bold text-gray-800">
                    {parsedResult.category}
                  </span>
                </div>
              </div>

              <div className="p-2 bg-white rounded-lg text-xs text-gray-700 border border-gray-200">
                <span className="text-[10px] text-gray-500 block">Merchant / Details:</span>
                <p className="font-medium">{parsedResult.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAdd}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md transition-colors flex items-center justify-center space-x-1 shadow-xs"
                >
                  <span>Add SMS Entry</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {!parsedResult && (
            <div className="pt-2 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
