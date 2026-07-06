import React, { useState } from 'react';
import { Calculator, X, Minus, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { formatNaira } from '../utils/formatters';

export const FloatingCalculator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [copied, setCopied] = useState(false);

  const handleNumClick = (val: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(val);
    } else {
      setDisplay((prev) => prev + val);
    }
  };

  const handleOpClick = (op: string) => {
    if (display === 'Error') return;
    setEquation((prev) => `${prev} ${display} ${op}`);
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    if (display.length <= 1 || display === 'Error') {
      setDisplay('0');
    } else {
      setDisplay((prev) => prev.slice(0, -1));
    }
  };

  const handleToggleSign = () => {
    if (display === '0' || display === 'Error') return;
    if (display.startsWith('-')) {
      setDisplay(display.substring(1));
    } else {
      setDisplay('-' + display);
    }
  };

  const handlePercent = () => {
    const num = parseFloat(display);
    if (!isNaN(num)) {
      setDisplay((num / 100).toString());
    }
  };

  const handleEquals = () => {
    try {
      const fullExpr = `${equation} ${display}`.trim();
      // Safe math evaluation
      const sanitized = fullExpr.replace(/×/g, '*').replace(/÷/g, '/');
      // Simple arithmetic evaluator
      // eslint-disable-next-line no-eval
      const result = eval(sanitized);
      if (typeof result === 'number' && !isNaN(result)) {
        setDisplay(Number(result.toFixed(2)).toString());
        setEquation('');
      } else {
        setDisplay('Error');
      }
    } catch {
      setDisplay('Error');
    }
  };

  const handleCopyResult = () => {
    const num = parseFloat(display);
    const textToCopy = !isNaN(num) ? formatNaira(num) : display;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg border-2 border-emerald-400/30 flex items-center justify-center transition-all hover:scale-105 group"
        title="Open Floating Calculator"
      >
        <Calculator className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
          Calculator
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-72 sm:w-80 bg-[#121417] text-white rounded-2xl border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
      
      {/* Header Bar */}
      <div className="bg-[#1A1C1E] px-4 py-2.5 flex items-center justify-between border-b border-gray-800 cursor-move select-none">
        <div className="flex items-center space-x-2 text-emerald-400">
          <Calculator className="w-4 h-4" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-white">
            Naira Calculator
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-rose-500/20 rounded text-gray-400 hover:text-rose-400 transition-colors"
            title="Close Calculator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3.5 space-y-3">
          
          {/* Display Area */}
          <div className="bg-black/60 p-3 rounded-xl border border-gray-800 text-right select-none space-y-1">
            <div className="text-[10px] text-gray-400 font-mono h-4 overflow-hidden text-ellipsis">
              {equation || ' '}
            </div>
            <div className="text-2xl font-black text-white font-mono tracking-tight overflow-x-auto scrollbar-none">
              {display}
            </div>
            {!isNaN(parseFloat(display)) && parseFloat(display) !== 0 && (
              <div className="text-[11px] text-emerald-400 font-bold font-mono">
                ≈ {formatNaira(parseFloat(display))}
              </div>
            )}
          </div>

          {/* Quick Copy Result Button */}
          <button
            onClick={handleCopyResult}
            className="w-full py-1.5 px-3 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied NGN Amount!' : 'Copy Formatted NGN (₦)'}</span>
          </button>

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={handleClear}
              className="py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs rounded-lg transition-colors"
            >
              C
            </button>
            <button
              onClick={handleBackspace}
              className="py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-lg transition-colors"
            >
              ⌫
            </button>
            <button
              onClick={handlePercent}
              className="py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-lg transition-colors"
            >
              %
            </button>
            <button
              onClick={() => handleOpClick('÷')}
              className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg transition-colors"
            >
              ÷
            </button>

            <button
              onClick={() => handleNumClick('7')}
              className="py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-colors"
            >
              7
            </button>
            <button
              onClick={() => handleNumClick('8')}
              className="py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-colors"
            >
              8
            </button>
            <button
              onClick={() => handleNumClick('9')}
              className="py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-colors"
            >
              9
            </button>
            <button
              onClick={() => handleOpClick('×')}
              className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg transition-colors"
            >
              ×
            </button>

            <button
              onClick={() => handleNumClick('4')}
              className="py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-colors"
            >
              4
            </button>
            <button
              onClick={() => handleNumClick('5')}
              className="py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-colors"
            >
              5
            </button>
            <button
              onClick={() => handleNumClick('6')}
              className="py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-colors"
            >
              6
            </button>
            <button
              onClick={() => handleOpClick('-')}
              className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg transition-colors"
            >
              -
            </button>

            <button
              onClick={() => handleNumClick('1')}
              className="py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-colors"
            >
              1
            </button>
            <button
              onClick={() => handleNumClick('2')}
              className="py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-colors"
            >
              2
            </button>
            <button
              onClick={() => handleNumClick('3')}
              className="py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-colors"
            >
              3
            </button>
            <button
              onClick={() => handleOpClick('+')}
              className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg transition-colors"
            >
              +
            </button>

            <button
              onClick={handleToggleSign}
              className="py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-lg transition-colors"
            >
              ±
            </button>
            <button
              onClick={() => handleNumClick('0')}
              className="py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-colors"
            >
              0
            </button>
            <button
              onClick={() => handleNumClick('.')}
              className="py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-colors"
            >
              .
            </button>
            <button
              onClick={handleEquals}
              className="py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-base rounded-lg transition-colors"
            >
              =
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
