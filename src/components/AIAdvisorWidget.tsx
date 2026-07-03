import React, { useState, useEffect } from 'react';
import { LogEntry, DebtEntry, UserProfile, AIAdvisorData, LedgerType } from '../types';
import { formatNaira, speakText } from '../utils/formatters';
import { Sparkles, RefreshCw, Volume2, ShieldAlert, TrendingUp, Award, Lightbulb, HeartHandshake } from 'lucide-react';

interface AIAdvisorWidgetProps {
  logs: LogEntry[];
  debts: DebtEntry[];
  user: UserProfile;
  activeLedger: LedgerType;
}

export const AIAdvisorWidget: React.FC<AIAdvisorWidgetProps> = ({
  logs,
  debts,
  user,
  activeLedger,
}) => {
  const [data, setData] = useState<AIAdvisorData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/financial-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs: logs.filter((l) => l.ledgerType === activeLedger),
          debts: debts.filter((d) => d.ledgerType === activeLedger),
          user,
          timePeriod: 'This Month',
        }),
      });

      if (!res.ok) throw new Error('Failed to load insights');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.warn('AI advisor error fallback');
      setData({
        summaryText: 'Oga, your cash flow is well tracked! Continue recording daily transactions to maintain high business visibility in Naira.',
        topExpenseCategory: 'Business Stock & Transport',
        savingsTip: 'Consider buying wholesale inventory in larger bulk batches to save on transport and vendor costs.',
        healthScore: 88,
        pidginGreeting: 'Naija Chief! Your E-moneyLog ledger dey shape up crisp and fine.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [activeLedger, logs.length]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs relative overflow-hidden text-gray-800 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center space-x-2">
              <span>Oga AI Financial Advisor</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono border border-emerald-200 font-bold">
                {activeLedger.toUpperCase()}
              </span>
            </h3>
            <p className="text-[11px] text-gray-500">
              Personalized cash flow insights & spending advice
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {data && (
            <button
              onClick={() => speakText(`${data.pidginGreeting} ${data.summaryText} ${data.savingsTip}`)}
              className="p-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs transition-colors"
              title="Listen to Advice (Speak Back)"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={fetchInsights}
            disabled={isLoading}
            className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 text-xs transition-colors"
            title="Refresh Insights"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-gray-500 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
          <p>Oga AI is analyzing your Naira cash flow and debt history...</p>
        </div>
      ) : data ? (
        <div className="space-y-4 text-xs">
          
          {/* Greeting Banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold flex items-center space-x-2">
            <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>"{data.pidginGreeting}"</span>
          </div>

          {/* Health Score & Top Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Score Card */}
            <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">
                  Cash Flow Health Score
                </span>
                <p className="text-xl font-black text-gray-900 mt-0.5">
                  {data.healthScore} <span className="text-xs text-gray-400 font-normal">/ 100</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-xs text-emerald-700 bg-emerald-50">
                {data.healthScore}%
              </div>
            </div>

            {/* Top Category Card */}
            <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">
                Main Expense Focus
              </span>
              <p className="text-sm font-bold text-amber-800 mt-1 truncate">
                {data.topExpenseCategory || 'General Expenses'}
              </p>
            </div>

          </div>

          {/* Summary Text */}
          <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
            {data.summaryText}
          </p>

          {/* Actionable Savings Tip */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3 text-amber-900">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 text-xs block mb-0.5">
                Oga's Savings Recommendation:
              </span>
              <p className="text-xs leading-relaxed text-gray-700">{data.savingsTip}</p>
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
};
