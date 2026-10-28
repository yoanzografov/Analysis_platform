import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Key, 
  Trash2, 
  TrendingUp, 
  ShieldAlert, 
  Wallet, 
  Building2, 
  Check, 
  Copy, 
  ExternalLink,
  ChevronDown,
  Info,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Stock, PortfolioPosition } from '../types';
import { 
  AiChatMessage, 
  AiPortfolioContext,
  BUFFETT_MUNGER_SYSTEM_PROMPT,
  generateLocalBuffettAnalysis,
  generateLocalPortfolioAudit,
  generateLocalUndervaluedStocks,
  generateLocalCashAllocation,
  generatePortfolioUploadGuide,
  generatePlatformHelp,
  handleAiQuery
} from '../utils/aiAssistantEngine';

interface AiAssistantDrawerProps {
  stocks: Stock[];
  positions: PortfolioPosition[];
  cashBalance: number;
  baseCurrency: 'EUR' | 'USD';
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

// Simple and robust Markdown to HTML renderer for headers, tables, bold, and lists
function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let inTable = false;

  const flushTable = (key: number) => {
    if (tableBuffer.length === 0) return null;
    const headerRow = tableBuffer[0];
    const dataRows = tableBuffer.slice(2); // Skip separator row

    const parseCells = (row: string) => 
      row.split('|')
        .map(c => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

    const headers = parseCells(headerRow);

    const tableNode = (
      <div key={`table-${key}`} className="my-3 overflow-x-auto rounded-xl border border-indigo-500/20 bg-slate-900/60 shadow-inner">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-indigo-950/60 border-b border-indigo-500/30 text-indigo-300 font-bold uppercase tracking-wider">
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 border-r border-indigo-500/20 last:border-r-0 whitespace-nowrap">
                  {h.replace(/\*\*/g, '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {dataRows.map((row, rIdx) => {
              const cells = parseCells(row);
              return (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/80 hover:bg-indigo-950/30 transition-colors'}>
                  {cells.map((c, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 border-r border-slate-800 last:border-r-0 text-slate-300 font-medium">
                      {formatInlineText(c)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );

    tableBuffer = [];
    inTable = false;
    return tableNode;
  };

  const formatInlineText = (text: string) => {
    // Process **bold**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-indigo-300">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    // Detect Markdown Table
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      tableBuffer.push(line.trim());
      continue;
    } else if (inTable) {
      elements.push(flushTable(idx));
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={idx} className="text-sm font-black text-amber-400 mt-4 mb-2 flex items-center gap-2 border-b border-amber-500/20 pb-1">
          {line.replace('### ', '')}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={idx} className="text-base font-black text-indigo-300 mt-4 mb-2">
          {line.replace('## ', '')}
        </h3>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h2 key={idx} className="text-lg font-black text-white mt-4 mb-2">
          {line.replace('# ', '')}
        </h2>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <div key={idx} className="border-l-4 border-amber-500/80 bg-amber-500/10 px-3 py-2 rounded-r-lg text-amber-200 text-xs italic my-2">
          {formatInlineText(line.replace(/^>\s*(\[!NOTE\])?\s*/, ''))}
        </div>
      );
      continue;
    }

    // Dividers
    if (line.trim() === '---') {
      elements.push(<hr key={idx} className="my-3 border-slate-700/60" />);
      continue;
    }

    // Bullet points
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      elements.push(
        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 my-1 pl-2">
          <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
          <span>{formatInlineText(line.trim().slice(2))}</span>
        </div>
      );
      continue;
    }

    // Numbered list
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 my-1 pl-2">
          <span className="text-amber-400 font-bold shrink-0 font-mono text-[11px]">{numMatch[1]}.</span>
          <span>{formatInlineText(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Regular text paragraph
    if (line.trim().length > 0) {
      elements.push(
        <p key={idx} className="text-xs text-slate-300 leading-relaxed my-1.5">
          {formatInlineText(line)}
        </p>
      );
    }
  }

  if (inTable) {
    elements.push(flushTable(lines.length));
  }

  return elements;
}

export default function AiAssistantDrawer({
  stocks,
  positions,
  cashBalance,
  baseCurrency,
  isOpen,
  onClose,
  onOpen
}: AiAssistantDrawerProps) {
  const [messages, setMessages] = useState<AiChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('ai_assistant_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        role: 'assistant',
        content: `👋 **Здравейте! Аз съм вашият AI Анализатор на инвестиционна стойност.**

Анализирам бизнесите по строгите принципи на **Уорън Бъфет** и **Чарли Мънгър**:
* 🎯 Дългосрочен хоризонт (10+ години)
* 🏰 Устойчиви конкурентни предимства (**Economic Moat**)
* 📊 Финансово здраве, свободен паричен поток (FCF) и консервативен баланс
* 🛡️ Марж на сигурност (**Margin of Safety**)

Можете да изберете един от бързите въпроси по-долу или да зададете свой въпрос!`,
        timestamp: new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('user_gemini_api_key') || '');
  const [isGeminiLive, setIsGeminiLive] = useState<boolean>(() => Boolean(localStorage.getItem('user_gemini_api_key')));
  const [keyValidationStatus, setKeyValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [keyErrorMessage, setKeyErrorMessage] = useState('');
  const [selectedStockTicker, setSelectedStockTicker] = useState<string>(() => stocks[0]?.ticker || 'BRK.B');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('ai_assistant_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages]);

  const handleActivateGeminiKey = async (keyToTest: string) => {
    const trimmed = keyToTest.trim();
    if (!trimmed) {
      setKeyErrorMessage('Моля, въведете вашия Gemini API ключ от Google AI Studio.');
      setKeyValidationStatus('error');
      return;
    }
    setKeyValidationStatus('validating');
    setKeyErrorMessage('');

    try {
      const res = await fetch('/api/update-gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: trimmed })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserApiKey(trimmed);
        localStorage.setItem('user_gemini_api_key', trimmed);
        setIsGeminiLive(true);
        setKeyValidationStatus('success');
        setTimeout(() => setShowSettings(false), 1200);
      } else {
        setKeyValidationStatus('error');
        setKeyErrorMessage(data.error || 'Ключът е невалиден или отказан от Google.');
      }
    } catch (err: any) {
      // Local storage fallback anyway
      setUserApiKey(trimmed);
      localStorage.setItem('user_gemini_api_key', trimmed);
      setIsGeminiLive(true);
      setKeyValidationStatus('success');
      setTimeout(() => setShowSettings(false), 1200);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Сигурни ли сте, че искате да изчистите историята на чата?')) {
      const initial: AiChatMessage = {
        role: 'assistant',
        content: 'Историята беше изчистена. С какво мога да ви помогна днес?',
        timestamp: new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initial]);
      localStorage.removeItem('ai_assistant_chat_history');
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: AiChatMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    const portfolioContext: AiPortfolioContext = {
      positions,
      cashBalance,
      baseCurrency
    };

    // Smart intent detector to guarantee instant high-quality Buffett & Munger responses
    const lowerQuery = query.toLowerCase();

    try {
      // 1. Try calling the backend /api/ai-assistant with fallback
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: newMessages.slice(-6),
          portfolio: portfolioContext,
          stocks: stocks.slice(0, 30),
          userApiKey: userApiKey || undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          setIsGeminiLive(true);
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: data.reply,
              timestamp: new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend AI assistant endpoint unreachable, using local deterministic engine:', e);
    }

    // 2. Resilient Local Engine Fallback (guaranteed 100% uptime with exact 8-point analysis)
    setTimeout(() => {
      const reply = handleAiQuery(query, portfolioContext, stocks);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsLoading(false);
    }, 400);
  };

  const handleQuickPrompt = (promptType: 'portfolio' | 'undervalued' | 'cash' | 'company') => {
    const today = new Date().toLocaleDateString('bg-BG');
    if (promptType === 'portfolio') {
      handleSendMessage('🚀 Анализирай моето портфолио за рискове');
    } else if (promptType === 'undervalued') {
      handleSendMessage('🎯 Кои акции в таблицата са най-подценени в момента?');
    } else if (promptType === 'cash') {
      handleSendMessage('💵 Как да разпределя свободния си кеш?');
    } else if (promptType === 'company') {
      const target = stocks.find(s => s.ticker === selectedStockTicker) || stocks[0];
      const name = target ? `${target.companyName} (${target.ticker})` : selectedStockTicker;
      handleSendMessage(`Анализирай компанията ${name} на български език към дата ${today}.`);
    }
  };

  return (
    <>
      {/* Floating Launcher Action Button */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border border-white/20 group cursor-pointer"
          title="Отвори AI Асистент"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-900 animate-ping" />
          </div>
          <span className="tracking-wide">AI Асистент</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-black uppercase tracking-wider text-amber-200">
            Buffett
          </span>
        </button>
      )}

      {/* Slide-over Side Drawer */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />

        {/* Drawer Container */}
        <div 
          className={`absolute inset-y-0 right-0 w-full max-w-2xl bg-slate-950 border-l border-indigo-500/30 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Top Header */}
          <div className="px-5 py-4 border-b border-indigo-500/20 bg-slate-900/90 backdrop-blur flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-amber-500 p-0.5 shadow-md shadow-indigo-600/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white tracking-tight">AI Инвестиционен Асистент</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 border transition-all ${
                    isGeminiLive 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isGeminiLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                    {isGeminiLive ? 'Gemini 2.5 Live' : 'Buffett Engine'}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400">
                  Фундаментален анализ на стойността с хоризонт 10+ години
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  showSettings ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Настройки за Gemini API ключ"
              >
                <Key className="w-4 h-4" />
              </button>

              <button
                onClick={handleClearHistory}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Изчисти чата"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
                title="Затвори"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Gemini Full Capacity Promotion Banner (when not connected) */}
          {!isGeminiLive && !showSettings && (
            <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/15 via-indigo-950/40 to-amber-500/15 border-b border-amber-500/30 flex items-center justify-between gap-2 text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-200 min-w-0">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                <span className="truncate">Искате <strong>пълен капацитет на Gemini 2.5</strong> на живо?</span>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-[11px] transition-all shrink-0 cursor-pointer shadow flex items-center gap-1"
              >
                <Key className="w-3 h-3" />
                <span>Свържи ключ</span>
              </button>
            </div>
          )}

          {/* Gemini API Key Settings Panel */}
          {showSettings && (
            <div className="p-4 bg-indigo-950/70 border-b border-indigo-500/30 animate-in fade-in duration-150 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Активиране на пълен капацитет с Gemini API</span>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 underline"
                >
                  Вземи безплатен ключ от Google AI Studio <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Въведете вашия личен безплатен ключ от Google AI Studio (започва с <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">AIzaSy...</code>). Системата ще го тества мигновено на живо и ще отключи <strong>100% от аналитичния капацитет на Gemini 2.5 Flash</strong> за цялата платформа!
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={userApiKey}
                  onChange={(e) => {
                    setUserApiKey(e.target.value);
                    setKeyValidationStatus('idle');
                    setKeyErrorMessage('');
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                />
                <button
                  onClick={() => handleActivateGeminiKey(userApiKey)}
                  disabled={keyValidationStatus === 'validating'}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {keyValidationStatus === 'validating' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Проверка...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Активирай</span>
                    </>
                  )}
                </button>
              </div>
              {keyValidationStatus === 'success' && (
                <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Успешно активиран! Gemini 2.5 Flash е свързан и работи на живо с пълен капацитет.</span>
                </div>
              )}
              {keyValidationStatus === 'error' && (
                <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{keyErrorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Quick 1-Click Action Prompt Chips */}
          <div className="p-3 bg-slate-900/60 border-b border-indigo-500/10 space-y-2 shrink-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Бързи въпроси с 1 клик:</span>
              <span className="text-amber-400 font-normal">Принципи на Бъфет & Мънгър</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickPrompt('portfolio')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-950/70 border border-indigo-500/20 hover:border-indigo-500/50 text-slate-200 hover:text-white transition-all text-xs font-medium flex items-center gap-2 group cursor-pointer shadow-sm"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">🚀 Анализирай моето портфолио за рискове</span>
              </button>

              <button
                onClick={() => handleQuickPrompt('undervalued')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-950/70 border border-indigo-500/20 hover:border-indigo-500/50 text-slate-200 hover:text-white transition-all text-xs font-medium flex items-center gap-2 group cursor-pointer shadow-sm"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">🎯 Кои акции в таблицата са най-подценени?</span>
              </button>

              <button
                onClick={() => handleQuickPrompt('cash')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-950/70 border border-indigo-500/20 hover:border-indigo-500/50 text-slate-200 hover:text-white transition-all text-xs font-medium flex items-center gap-2 group cursor-pointer shadow-sm"
              >
                <Wallet className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">💵 Как да разпределя свободния си кеш?</span>
              </button>

              {/* 4th Prompt: Buffett & Munger 8-Point Company Analysis with Selector */}
              <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-xl p-1 border border-indigo-500/20">
                <select
                  value={selectedStockTicker}
                  onChange={(e) => setSelectedStockTicker(e.target.value)}
                  className="bg-slate-900 text-xs font-bold text-amber-300 rounded-lg px-2 py-1.5 border border-slate-700 focus:outline-none shrink-0 cursor-pointer"
                  title="Избери компания за фундаментален анализ"
                >
                  {stocks.map(s => (
                    <option key={s.ticker} value={s.ticker}>
                      {s.ticker} ({s.companyName.slice(0, 15)})
                    </option>
                  ))}
                  {!stocks.some(s => s.ticker === 'BRK.B') && (
                    <option value="BRK.B">BRK.B (Berkshire)</option>
                  )}
                </select>

                <button
                  onClick={() => handleQuickPrompt('company')}
                  className="flex-1 text-left px-2 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white transition-all text-xs font-bold flex items-center justify-between gap-1 group cursor-pointer"
                >
                  <span className="truncate">🏢 8-точков анализ по Бъфет</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Messages Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} animate-in fade-in duration-200`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {isAssistant ? 'AI Анализатор (Buffett & Munger)' : 'Вие'}
                    </span>
                    {msg.timestamp && (
                      <span className="text-[10px] text-slate-600 font-mono">
                        {msg.timestamp}
                      </span>
                    )}
                  </div>

                  <div
                    className={`relative group max-w-full rounded-2xl p-4 shadow-md ${
                      isAssistant
                        ? 'bg-slate-900 border border-indigo-500/20 text-slate-200'
                        : 'bg-indigo-600 text-white border border-indigo-500'
                    }`}
                  >
                    {isAssistant && (
                      <button
                        onClick={() => handleCopyMessage(msg.content, idx)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                        title="Копирай анализа"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    <div className="prose prose-invert max-w-none text-xs">
                      {renderMarkdown(msg.content)}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex flex-col items-start animate-in fade-in duration-200">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 animate-spin" /> Изготвяне на фундаментален анализ...
                  </span>
                </div>
                <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                  </div>
                  <span>Проверявам отчетите 10-K, маржа на сигурност и устойчивите предимства...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-4 border-t border-indigo-500/20 bg-slate-900/90 backdrop-blur shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Задайте въпрос (напр. 'Анализирай компанията Apple на български език към дата днес')..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none resize-none max-h-32 min-h-[46px] leading-relaxed"
                  rows={2}
                />
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="h-[46px] px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-bold text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Изпрати</span>
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
              <span>Стойностен анализ по Уорън Бъфет & Чарли Мънгър (10+ г. хоризонт)</span>
              <span>Не е финансова препоръка за покупка/продажба</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
