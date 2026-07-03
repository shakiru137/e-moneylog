import React, { useState, useEffect } from 'react';
import { LogEntry, LedgerType } from '../types';
import { formatNaira, speakText } from '../utils/formatters';
import { Mic, MicOff, Volume2, Sparkles, X, Check, ArrowRight, RefreshCw, AlertCircle, VolumeX } from 'lucide-react';

interface VoiceLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLedger: LedgerType;
  onAddLog: (log: Omit<LogEntry, 'id' | 'userId'>) => void;
  isVoiceFeedbackEnabled: boolean;
}

export const VoiceLogModal: React.FC<VoiceLogModalProps> = ({
  isOpen,
  onClose,
  activeLedger,
  onAddLog,
  isVoiceFeedbackEnabled,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<{
    amount: number;
    type: 'income' | 'expense';
    category: string;
    note: string;
    corrected_phrase: string;
    audioFeedbackText: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick preset samples for testing Nigerian accent pronunciation correction
  const PRESET_VOICE_SAMPLES = [
    'Spent five handred for bread and tea',
    'Person pay me twenty k for website design',
    'I dash am two tousan naira for transport',
    'I pay fifteen tousan naira for fuel for generator',
    'Customer buy fabric wholesale one hundred and twenty thousand naira',
  ];

  useEffect(() => {
    if (!isOpen) {
      setIsRecording(false);
      setRawText('');
      setParsedResult(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Web Speech Recognition handler
  const handleStartRecording = () => {
    setErrorMsg(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Browser speech recognition not directly supported on this device. You can type or tap a sample below to test AI speech correction!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-NG'; // Nigerian English context

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setRawText(transcript);
        setIsRecording(false);
        // Auto process
        processVoiceText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        setErrorMsg('Microphone input ended or timed out. You can type your voice input below.');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e: any) {
      setIsRecording(false);
      setErrorMsg('Could not access microphone. Please type your phrase below.');
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const processVoiceText = async (textToParse: string) => {
    if (!textToParse.trim()) {
      setErrorMsg('Please speak or type a financial phrase first.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/voice-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToParse,
          userContext: { ledgerType: activeLedger, location: 'Nigeria' },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to reach AI voice engine');
      }

      const data = await res.json();
      setParsedResult(data);

      // Speak Back Feedback
      if (isVoiceFeedbackEnabled && data.audioFeedbackText) {
        speakText(data.audioFeedbackText);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing voice text');
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
      description: parsedResult.note || rawText,
      source: 'voice',
      ledgerType: activeLedger,
      date: new Date().toISOString().split('T')[0],
      rawVoiceTranscript: rawText,
      correctedPhrase: parsedResult.corrected_phrase,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden text-gray-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">AI Voice Cash Book</h3>
              <p className="text-xs text-gray-500">
                Speak in Nigerian English/Pidgin to log in Naira (₦)
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

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          
          {/* Voice Record Controls */}
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200 text-center relative overflow-hidden">
            
            {/* Visualizer Pulse Effect */}
            {isRecording && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-40 h-40 rounded-full bg-emerald-500 animate-ping"></div>
              </div>
            )}

            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-md ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse ring-8 ring-red-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>

            <p className="mt-4 text-xs font-semibold text-gray-700">
              {isRecording
                ? 'Listening... Speak now e.g. "Spent 500 for bread"'
                : 'Tap Microphone to Speak'}
            </p>

            {/* Quick Presets for Instant Testing */}
            <div className="mt-4 w-full text-left">
              <p className="text-[11px] font-medium text-gray-500 mb-1.5">
                Or tap a sample to test AI speech correction:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_VOICE_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setRawText(sample);
                      processVoiceText(sample);
                    }}
                    className="text-[11px] px-2.5 py-1 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-200 hover:border-emerald-300 rounded-md transition-colors text-left truncate max-w-full"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Manual Input / Raw Text Box */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Voice Transcript / Text Input:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder='e.g. "Customer pay me 20k for shoes" or "Spent 500 naira on lunch"'
                className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
              <button
                onClick={() => processVoiceText(rawText)}
                disabled={isLoading || !rawText.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors flex items-center space-x-1"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Parse AI</span>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* AI Result Card */}
          {parsedResult && (
            <div className="p-4 bg-gray-50 border border-emerald-300 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Extracted & Corrected</span>
                </span>

                {/* Speak Back Button */}
                <button
                  onClick={() => speakText(parsedResult.audioFeedbackText || parsedResult.corrected_phrase)}
                  className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-semibold rounded border border-emerald-200 flex items-center space-x-1 transition-colors"
                  title="Play Voice Feedback"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Speak Back</span>
                </button>
              </div>

              {/* Pronunciation Error Fix Preview */}
              <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-xs space-y-1">
                <p className="text-gray-400 line-through text-[11px]">
                  Raw Voice: "{rawText}"
                </p>
                <p className="font-semibold text-emerald-700 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{parsedResult.corrected_phrase}</span>
                </p>
              </div>

              {/* Extracted Key Details */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 block">Amount</span>
                  <span className="font-extrabold text-gray-900 text-sm">
                    {formatNaira(parsedResult.amount)}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 block">Type</span>
                  <span
                    className={`font-bold capitalize text-xs ${
                      parsedResult.type === 'income'
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {parsedResult.type}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 block">Category</span>
                  <span className="font-medium text-gray-700 text-[11px] truncate block">
                    {parsedResult.category}
                  </span>
                </div>
              </div>

              {/* Confirm & Save Button */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAdd}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-md shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Save Entry</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Bottom Cancel Option when result is not yet parsed */}
          {!parsedResult && (
            <div className="pt-2 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-md transition-colors"
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
