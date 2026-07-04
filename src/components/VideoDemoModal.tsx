import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, Sparkles, Mic, Smartphone, Wallet, Users, FileText, CheckCircle2, ChevronRight, Download, Ban } from 'lucide-react';

interface VideoDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoiceModal?: () => void;
  onOpenSMSModal?: () => void;
  onOpenAddModal?: () => void;
}

interface Scene {
  id: number;
  timeStart: number;
  timeEnd: number;
  title: string;
  subtitle: string;
  narration: string;
  badge: string;
  icon: React.ElementType;
}

const SCENES: Scene[] = [
  {
    id: 1,
    timeStart: 0,
    timeEnd: 12,
    title: "1. Quick Login & Multi-Ledger Setup",
    subtitle: "Sign in with Google, Email or SMS. Separate Business, Personal & Joint Cash Books instantly.",
    narration: "Welcome to E-moneyLog! Log in securely with Google, Email, or SMS OTP. Your cash book starts clean with separate Business, Personal, and Joint ledgers.",
    badge: "Multi-Auth & Ledgers",
    icon: Wallet,
  },
  {
    id: 2,
    timeStart: 12,
    timeEnd: 24,
    title: "2. Record Transactions via AI Voice",
    subtitle: "Tap the Mic and speak naturally in English or Pidgin to log income or expenses in Naira.",
    narration: "Hands full? Simply tap the AI Voice button and speak naturally, like: 'I spent ₦8,500 on generator fuel'. The AI logs it instantly!",
    badge: "AI Voice Recognition",
    icon: Mic,
  },
  {
    id: 3,
    timeStart: 24,
    timeEnd: 36,
    title: "3. Auto Bank SMS Alert Parser",
    subtitle: "Paste any GTBank, Zenith, OPay, or Access SMS alert to log transactions automatically.",
    narration: "Received a debit or credit SMS from your bank? Use our SMS Sync tool to auto-fill amount, sender name, and categorization in one click.",
    badge: "Bank SMS Sync",
    icon: Smartphone,
  },
  {
    id: 4,
    timeStart: 36,
    timeEnd: 48,
    title: "4. Debt & Credit Tracker (Gbese Book)",
    subtitle: "Track customers who owe you money and send automatic WhatsApp payment reminders.",
    narration: "Never lose track of customer debts. Log who owes you money, set due dates, and send instant WhatsApp payment reminders.",
    badge: "Customer Debt Tracker",
    icon: Users,
  },
  {
    id: 5,
    timeStart: 48,
    timeEnd: 60,
    title: "5. Real-Time Analytics & PDF Exports",
    subtitle: "View income vs. expense graphs, net profit balances, and export financial statements.",
    narration: "Monitor your profit margins with interactive charts, and generate official PDF reports for tax filings or business partners.",
    badge: "Reports & PDF Export",
    icon: FileText,
  }
];

export const VideoDemoModal: React.FC<VideoDemoModalProps> = ({
  isOpen,
  onClose,
  onOpenVoiceModal,
  onOpenSMSModal,
  onOpenAddModal,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const totalDuration = 60; // 60 seconds

  const currentScene = SCENES.find(
    (s) => currentTime >= s.timeStart && currentTime < s.timeEnd
  ) || SCENES[SCENES.length - 1];

  const prevSceneIdRef = useRef<number>(0);

  // Playback timer ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOpen && isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            return 0; // Loop or pause
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isPlaying]);

  // Handle Voice Narration when scene changes
  useEffect(() => {
    if (isOpen && speechEnabled && !isMuted && 'speechSynthesis' in window) {
      if (currentScene.id !== prevSceneIdRef.current) {
        prevSceneIdRef.current = currentScene.id;
        window.speechSynthesis.cancel(); // Stop prior speech
        const utterance = new SpeechSynthesisUtterance(currentScene.narration);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } else if (isMuted || !isOpen) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [currentScene, isOpen, speechEnabled, isMuted]);

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    const guideText = `=====================================================
E-MONEYLOG OFFICIAL APP WALKTHROUGH & USER GUIDE (60s)
=====================================================

Overview:
E-moneyLog is your smart, voice-enabled cash book & debt ledger for daily business and personal finance management in Nigeria & global markets.

-----------------------------------------------------
WALKTHROUGH TIMELINE BREAKDOWN (60 SECONDS)
-----------------------------------------------------

[00:00 - 00:12] SCENE 1: QUICK LOGIN & MULTI-LEDGER SETUP
- Sign in with Google, Email, or SMS OTP verification.
- Switch seamlessly between 💼 Business, 👤 Personal, and 👥 Joint/Store ledgers.
- Every new user starts with ₦0 balance for complete privacy.

[00:12 - 00:24] SCENE 2: AI VOICE RECORDING
- Tap the microphone button in the navigation bar or floating action button.
- Speak naturally in English or Nigerian Pidgin (e.g. "I spent ₦8,500 on generator fuel").
- AI automatically detects Cash In / Cash Out, amount, category, and date.

[00:24 - 00:36] SCENE 3: AUTOMATIC BANK SMS ALERT PARSER
- Copy any debit or credit alert SMS from GTBank, Zenith, OPay, Kuda, Access, or FirstBank.
- Paste it into the "Bank SMS Sync" modal.
- E-moneyLog parses sender name, account reference, transaction type, and amount in 1 click.

[00:36 - 00:48] SCENE 4: CUSTOMER DEBT & CREDIT TRACKER (GBESE BOOK)
- Log customers or suppliers who owe you money or whom you owe.
- Set due dates and track partial payments.
- Click "Send WhatsApp Reminder" to auto-generate polite payment reminder messages.

[00:48 - 01:00] SCENE 5: REAL-TIME FINANCIAL ANALYTICS & EXPORTS
- View net profit, total cash in, total cash out, and category charts.
- Export official PDF cash book reports or Excel spreadsheets for accounting.

-----------------------------------------------------
Thank you for choosing E-moneyLog!
Safe, secure, and reliable cash logging.
`;

    const blob = new Blob([guideText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'E-moneyLog_Video_Walkthrough_Guide.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  if (!isOpen) return null;

  const progressPercentage = (currentTime / totalDuration) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#121417] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden text-gray-100 flex flex-col max-h-[92vh]">
        
        {/* Video Player Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1A1C1E] border-b border-gray-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold shadow-xs">
              <Play className="w-4 h-4 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">E-moneyLog Official Video Walkthrough</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                  Simulated Preview
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded">
                  HD 60s Guide
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Learn how to record voice logs, parse SMS alerts, and track debts in 1 minute
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5 shadow-xs"
              title="Download Walkthrough Video Guide File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download Video Guide</span>
            </button>
            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                onClose();
              }}
              className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
              title="Cancel & Close Video"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        {/* Download Toast Success Banner */}
        {downloadSuccess && (
          <div className="bg-emerald-500 text-black px-4 py-2 text-xs font-bold flex items-center justify-between animate-fade-in shrink-0">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>E-moneyLog Video Walkthrough & User Guide Downloaded Successfully!</span>
            </div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-black/10 px-2 py-0.5 rounded">Saved .txt</span>
          </div>
        )}

        {/* Video Stage / Canvas Area */}
        <div className="relative flex-1 bg-black min-h-[320px] sm:min-h-[380px] flex items-center justify-center overflow-hidden p-4">
          
          {/* Animated Scene Viewports */}
          <div className="w-full max-w-2xl bg-[#1A1D21] border border-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 space-y-4 transition-all duration-500">
            
            {/* Scene Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                {React.createElement(currentScene.icon, { className: "w-5 h-5 text-emerald-400" })}
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {currentScene.badge}
                </span>
              </div>
              <span className="text-[11px] font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                Scene {currentScene.id} / 5
              </span>
            </div>

            {/* Scene Graphic Display */}
            <div className="relative bg-[#0F1113] rounded-lg p-5 border border-gray-800/80 min-h-[180px] flex flex-col justify-center space-y-3">
              
              {/* Scene 1 Mockup */}
              {currentScene.id === 1 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-around bg-gray-900 p-2.5 rounded-md border border-gray-800 text-xs">
                    <span className="text-emerald-400 font-bold">✓ Google Sign In</span>
                    <span className="text-emerald-400 font-bold">✓ Email Login</span>
                    <span className="text-emerald-400 font-bold">✓ Phone OTP</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-emerald-950/40 border border-emerald-500/40 p-2 rounded text-emerald-300 font-bold">
                      💼 Business Book
                    </div>
                    <div className="bg-gray-800/60 border border-gray-700 p-2 rounded text-gray-300">
                      👤 Personal Book
                    </div>
                    <div className="bg-gray-800/60 border border-gray-700 p-2 rounded text-gray-300">
                      👥 Joint / Store
                    </div>
                  </div>
                </div>
              )}

              {/* Scene 2 Mockup */}
              {currentScene.id === 2 && (
                <div className="space-y-3 text-center animate-fade-in">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 animate-pulse mx-auto">
                    <Mic className="w-7 h-7 text-emerald-400" />
                  </div>
                  <p className="text-sm font-mono text-amber-300 bg-black/40 p-2 rounded border border-amber-500/30">
                    "I spent ₦8,500 on generator fuel for shop"
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-xs text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Recognized: Cash Out ₦8,500 • Category: Fuel & Utilities</span>
                  </div>
                </div>
              )}

              {/* Scene 3 Mockup */}
              {currentScene.id === 3 && (
                <div className="space-y-2.5 animate-fade-in">
                  <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-lg text-xs font-mono text-amber-200">
                    "Gtbank Acct: 012****345 Amt: N25,000.00 CR Desc: Transfer from BOLA AHMED"
                  </div>
                  <div className="flex items-center justify-between bg-emerald-900/30 border border-emerald-500/40 p-2 rounded text-xs text-emerald-300 font-semibold">
                    <span>✓ Auto-Parsed Credit: ₦25,000</span>
                    <span className="bg-emerald-500 text-black px-2 py-0.5 rounded font-bold text-[10px]">Saved to Ledger</span>
                  </div>
                </div>
              )}

              {/* Scene 4 Mockup */}
              {currentScene.id === 4 && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between bg-rose-950/40 border border-rose-500/40 p-2.5 rounded text-xs text-rose-200">
                    <div>
                      <p className="font-bold">Musa Electronics (Owes Money)</p>
                      <p className="text-[10px] text-rose-300">Due: In 2 Days • ₦45,000</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold text-[11px] flex items-center space-x-1">
                      <span>WhatsApp Reminder</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Scene 5 Mockup */}
              {currentScene.id === 5 && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs bg-gray-900 p-2 rounded border border-gray-800">
                    <span>Total Cash In: <strong className="text-emerald-400">₦285,000</strong></span>
                    <span>Total Cash Out: <strong className="text-rose-400">₦62,000</strong></span>
                    <span>Net Balance: <strong className="text-amber-300">₦223,000</strong></span>
                  </div>
                  <div className="flex justify-center space-x-2 pt-1">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-bold">
                      📄 Export PDF Statement
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-bold">
                      📊 Excel Spreadsheet
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Subtitles & Captions Bar */}
            <div className="bg-black/60 border border-gray-800 rounded-lg p-3 text-center">
              <h4 className="text-sm font-bold text-white">{currentScene.title}</h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">{currentScene.subtitle}</p>
            </div>

          </div>

          {/* Floating Action Hint */}
          <div className="absolute top-4 right-4 hidden md:flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Guide</span>
          </div>

        </div>

        {/* Timeline Scrubber Bar */}
        <div className="px-4 pt-2 bg-[#16181B] border-t border-gray-800">
          <div className="relative w-full h-2 bg-gray-800 rounded-full cursor-pointer overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              setCurrentTime(Math.floor(pos * totalDuration));
            }}
          >
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Video Player Controls Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-[#1A1C1E] border-t border-gray-800 gap-3 shrink-0">
          
          {/* Playback Controls & Scrubber */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white transition-colors"
              title={isPlaying ? "Pause Video" : "Play Video"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <button
              onClick={() => setCurrentTime(0)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              title="Restart Video"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono text-gray-400">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </span>

            {/* Mute/Voice Control */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center space-x-1"
              title={isMuted ? "Unmute Voice Narration" : "Mute Voice Narration"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span className="text-[11px] hidden xs:inline">{isMuted ? 'Muted' : 'Voice On'}</span>
            </button>
          </div>

          {/* Quick Scene Selector Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto max-w-full">
            {SCENES.map((scene) => (
              <button
                key={scene.id}
                onClick={() => {
                  setCurrentTime(scene.timeStart);
                  setIsPlaying(true);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  currentScene.id === scene.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                Scene {scene.id}
              </button>
            ))}
          </div>

          {/* Action & Download / Cancel Controls */}
          <div className="flex items-center space-x-2">
            {currentScene.id === 2 && onOpenVoiceModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenVoiceModal();
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1"
              >
                <span>Try Voice Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentScene.id === 3 && onOpenSMSModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSMSModal();
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1"
              >
                <span>Try SMS Sync</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentScene.id === 1 && onOpenAddModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAddModal();
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1"
              >
                <span>Add Log Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1"
              title="Download Video Walkthrough Guide"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Guide</span>
            </button>

            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                onClose();
              }}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
              title="Cancel Video Walkthrough"
            >
              <Ban className="w-3.5 h-3.5 text-rose-400" />
              <span>Cancel</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
