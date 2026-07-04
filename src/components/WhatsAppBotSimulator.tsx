import React, { useState } from 'react';
import { LogEntry, LedgerType } from '../types';
import { formatNaira } from '../utils/formatters';
import { MessageSquare, Send, Bot, CheckCheck, Mic, Sparkles, User, RefreshCw } from 'lucide-react';

interface WhatsAppBotSimulatorProps {
  activeLedger: LedgerType;
  onAddLog: (log: Omit<LogEntry, 'id' | 'userId'>) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isLogged?: boolean;
}

export const WhatsAppBotSimulator: React.FC<WhatsAppBotSimulatorProps> = ({
  activeLedger,
  onAddLog,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: '🇳🇬 Welcome to E-moneyLog WhatsApp Bot! You can send any text or voice message like "I spent 3500 on fuel" or paste a bank SMS, and I will auto-log it in Naira for you!',
      timestamp: '10:00 AM',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/voice-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToSend,
          userContext: { ledgerType: activeLedger },
        }),
      });

      const data = await res.json();

      // Add to main app state
      onAddLog({
        amount: data.amount || 2000,
        type: data.type || 'expense',
        category: data.category || 'General',
        description: data.note || textToSend,
        source: 'whatsapp',
        ledgerType: activeLedger,
        date: new Date().toISOString().split('T')[0],
        correctedPhrase: data.corrected_phrase,
      });

      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `✅ ${data.corrected_phrase || 'Logged Entry!'}\n\nAmount: ${formatNaira(data.amount || 2000)}\nCategory: ${data.category || 'General'}\nType: ${(data.type || 'expense').toUpperCase()}\n\nSaved to your ${activeLedger.toUpperCase()} Book!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLogged: true,
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '⚠️ I had trouble parsing that. Please try e.g. "Spent ₦5,000 for transport"',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botReply]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden max-w-2xl mx-auto">
      
      {/* WhatsApp Header */}
      <div className="bg-[#1A1C1E] border-b border-gray-800 p-3.5 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-md bg-emerald-500 flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white flex items-center space-x-1.5">
              <span>E-moneyLog WhatsApp Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h4>
            <p className="text-[11px] text-gray-400 font-mono">+234 812 E-MONEY</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
            Simulated Preview
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
            Live Simulator
          </span>
        </div>
      </div>

      {/* WhatsApp Chat Body */}
      <div className="p-4 bg-gray-50 min-h-[300px] max-h-[380px] overflow-y-auto space-y-3 font-sans text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
              <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] opacity-70">
                <span>{msg.timestamp}</span>
                {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 p-2.5 rounded-lg rounded-bl-none border border-gray-200 flex items-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>AI is processing your WhatsApp message...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Test Chips */}
      <div className="p-2 bg-gray-100 border-t border-gray-200 flex flex-wrap gap-1.5">
        <span className="text-[10px] text-gray-500 font-semibold self-center px-1">Try:</span>
        {['Spent 5000 for fuel', 'Client credit me 25000 for goods', 'I pay 1500 for lunch'].map((sample, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sample)}
            className="text-[11px] px-2.5 py-1 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-200 rounded transition-colors"
          >
            "{sample}"
          </button>
        ))}
      </div>

      {/* WhatsApp Input Bar */}
      <div className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type message to log e.g. Spent 10k for shoes..."
          className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-md shadow-xs transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
