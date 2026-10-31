import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Trash2, 
  TrendingUp, 
  ShieldAlert, 
  Wallet, 
  Building2, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  FlaskConical, 
  Zap, 
  Snowflake, 
  ShieldCheck, 
  LineChart, 
  Globe, 
  Mic, 
  MicOff, 
  Printer, 
  Download, 
  Swords, 
  Sun, 
  Flame, 
  Edit3, 
  Bell 
} from 'lucide-react';
import { Stock, PortfolioPosition, MarketIndex } from '../types';
import { 
  AiChatMessage, 
  AiPortfolioContext,
  InvestorPersona,
  INVESTOR_PERSONAS,
  BUFFETT_MUNGER_SYSTEM_PROMPT,
  generateLocalBuffettAnalysis,
  generateLocalPortfolioAudit,
  generateLocalUndervaluedStocks,
  generateLocalCashAllocation,
  generatePortfolioUploadGuide,
  generatePlatformHelp,
  generateHeadToHeadComparison,
  generateDailyMarketBriefing,
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
  indices?: MarketIndex[];
  onUpdateStock?: (oldTicker: string, updatedStock: Stock) => void;
  onAddAlert?: (ticker: string, criteria: 'ABOVE' | 'BELOW', targetPrice: number) => void;
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
    // Process markdown links [text](url) and **bold**
    const parts = text.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*.*?\*\*)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-indigo-300">{part.slice(2, -2)}</strong>;
      }
      const match = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(part);
      if (match) {
        return (
          <a
            key={i}
            href={match[2]}
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 hover:text-amber-300 underline font-semibold transition-colors"
          >
            {match[1]}
          </a>
        );
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
  onOpen,
  indices = [],
  onUpdateStock,
  onAddAlert
}: AiAssistantDrawerProps) {
  const [persona, setPersona] = useState<InvestorPersona>(() => {
    try {
      const saved = localStorage.getItem('ai_assistant_persona') as InvestorPersona;
      if (saved && INVESTOR_PERSONAS[saved]) return saved;
    } catch {}
    return 'buffett';
  });

  const [messages, setMessages] = useState<AiChatMessage[]>(() => {
    // Purge any legacy stored history so chat always starts clean on re-entry
    try {
      localStorage.removeItem('ai_assistant_chat_history');
    } catch {}
    return [
      {
        role: 'assistant',
        content: `👋 **Здравейте! Аз съм вашият цялостен AI Инвестиционен Анализатор.**

В моя аналитичен модел са обединени в едно цяло знанията, формулите и философията на най-великите инвеститори:
* 🏛️ **Уорън Бъфет & Чарли Мънгър** – Дългосрочна стойност, икономически ров (**Moat**) и 10-те правила за анализ на финансовите отчети
* 📖 **Бенджамин Греъм** – **Марж на безопасност (Margin of Safety)**, 7-те критерия на Защитния инвеститор, **Число на Греъм** и **Г-н Пазар**
* 🚀 **Питър Линч** – Растеж на разумна цена (**PEG < 1.0**) и наблюдение на реалния бизнес
* 💰 **Дивидентна снежна топка** – Пасивен паричен поток, FCF покритие и устойчивост
* 🌍 **Рей Далио (All-Weather)** – Макро цикли, лихвени криви и диверсификация при кризи
* 🚦 **Финансов светофар (BojanFin & Brian Feroldi)** – Зелени, жълти и червени флагове за баланса и отчетите 10-K

Задайте ми свободен въпрос за всяка акция от таблицата, пазарен спад, финансови отчети или инвестиционна формула!`,
        timestamp: new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedStockTicker, setSelectedStockTicker] = useState<string>(() => stocks[0]?.ticker || 'BRK.B');
  const [showSkills, setShowSkills] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    try {
      localStorage.setItem('ai_assistant_persona', persona);
    } catch {}
  }, [persona]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages]);

  const toggleVoiceRecording = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Гласовото разпознаване не се поддържа от този браузър. Моля, използвайте Google Chrome или Microsoft Edge.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'bg-BG';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition failed to start:', err);
      setIsRecording(false);
    }
  };

  const handleExportReport = (content: string) => {
    const pMeta = INVESTOR_PERSONAS[persona];
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Моля, разрешете изскачащите прозорци (popups) в браузъра за генериране на официалния PDF доклад.');
      return;
    }

    const htmlBody = content
      .replace(/^### (.*$)/gim, '<h3 style="color:#0f172a; margin-top:20px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="color:#4f46e5; margin-top:24px;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="color:#0f172a; margin-top:28px;">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong style="color:#0f172a;">$1</strong>')
      .replace(/^\* (.*$)/gim, '<li style="margin:4px 0;">$1</li>')
      .replace(/\|(.+)\|/gim, (match) => {
        const cells = match.split('|').map(c => c.trim()).filter((_, i, a) => i > 0 && i < a.length - 1);
        if (cells.some(c => c.includes('---'))) return '';
        return `<tr>${cells.map(c => `<td style="border:1px solid #cbd5e1; padding:8px 12px;">${c}</td>`).join('')}</tr>`;
      })
      .replace(/\n\n/g, '<br/><br/>');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="bg">
      <head>
        <meta charset="UTF-8">
        <title>RayVes Capital - Инвестиционен Доклад</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 900px; margin: 0 auto; line-height: 1.6; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; }
          .brand { font-size: 24px; font-weight: 900; color: #4f46e5; letter-spacing: -0.5px; }
          .tagline { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-top: 4px; }
          .pill { background: #e0e7ff; color: #3730a3; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 800; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background: #f8fafc; font-weight: 800; color: #1e293b; }
          tr:nth-child(even) { background: #f8fafc; }
          .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #cbd5e1; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">RAYVES CAPITAL</div>
            <div class="tagline">Investing Today. Building Tomorrow. For Our Children. For Their Future.</div>
          </div>
          <div class="pill">
            ${pMeta.icon} ${pMeta.name} • ${new Date().toLocaleDateString('bg-BG')}
          </div>
        </div>
        <div>${htmlBody}</div>
        <div class="footer">
          <span>Източник: RayVes Capital Investment Platform • Анализатор: ${pMeta.name}</span>
          <span>Официални данни: StockAnalysis.com • Investopedia.com • SEC 10-K / 10-Q</span>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const detectActionsFromMessage = (content: string) => {
    const titleMatch = content.match(/Фундаментален анализ на .*?\(([A-Z0-9.]+)\)/i) || 
                       content.match(/Анализ на спада: .*?\(([A-Z0-9.]+)\)/i) ||
                       content.match(/Piotroski F-Score Анализ: .*?\(([A-Z0-9.]+)\)/i) ||
                       content.match(/Reverse DCF.*?:\s*.*?\(([A-Z0-9.]+)\)/i) ||
                       content.match(/Оценка по модела на Питър Линч:\s*.*?\(([A-Z0-9.]+)\)/i) ||
                       content.match(/Altman Z-Score.*?:\s*.*?\(([A-Z0-9.]+)\)/i) ||
                       content.match(/Economic Moat.*?:\s*.*?\(([A-Z0-9.]+)\)/i);

    if (titleMatch) {
      const sym = titleMatch[1].trim().toUpperCase();
      const s = stocks.find(st => st.ticker.toUpperCase() === sym);
      if (s) {
        const fairMatch = content.match(/Справедлива стойност.*?\$([0-9,.]+)/i) || 
                          content.match(/Fair Value.*?\$([0-9,.]+)/i) || 
                          content.match(/Справедлива цена по Питър Линч.*?\$([0-9,.]+)/i);
        const fairVal = fairMatch ? parseFloat(fairMatch[1].replace(/,/g, '')) : (s.fairPrice || s.currentPrice);
        return { ticker: sym, stock: s, fairPrice: fairVal };
      }
    }
    return null;
  };

  const handleApplyFairPrice = (targetTicker: string, newFairVal: number) => {
    if (!onUpdateStock) return;
    const target = stocks.find(s => s.ticker.toUpperCase() === targetTicker.toUpperCase());
    if (!target) return;

    const diff = target.currentPrice > 0 ? ((newFairVal - target.currentPrice) / target.currentPrice) * 100 : 0;
    const buySell = newFairVal > target.currentPrice ? 'UNDERVALUED' : 'OVERVALUED';

    const updated: Stock = {
      ...target,
      fairPrice: newFairVal,
      difference: diff,
      buySell
    };

    onUpdateStock(target.ticker, updated);
    setActionSuccessToast(`✅ Записахте Fair Price $${newFairVal.toFixed(2)} за ${targetTicker} в интерактивната таблица!`);
    setTimeout(() => setActionSuccessToast(null), 4000);
  };

  const handleApplyPriceAlert = (targetTicker: string, targetPrice: number) => {
    if (!onAddAlert) return;
    onAddAlert(targetTicker, 'BELOW', targetPrice);
    setActionSuccessToast(`🔔 Настроихте Price Alert за ${targetTicker} под $${targetPrice.toFixed(2)}!`);
    setTimeout(() => setActionSuccessToast(null), 4000);
  };

  const handleClearHistory = () => {
    const initial: AiChatMessage = {
      role: 'assistant',
      content: 'Историята беше изчистена. С какво мога да ви помогна днес?',
      timestamp: new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initial]);
    try {
      localStorage.removeItem('ai_assistant_chat_history');
    } catch {}
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

    try {
      // 1. Try calling the backend /api/ai-assistant (if server key is active)
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: newMessages.slice(-6),
          portfolio: portfolioContext,
          stocks: stocks.slice(0, 30),
          persona
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
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
      const reply = handleAiQuery(query, portfolioContext, stocks, persona, indices);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsLoading(false);
    }, 450);
  };

  const handleQuickPrompt = (promptType: 'portfolio' | 'undervalued' | 'cash' | 'company' | 'briefing' | 'duel' | 'graham-audit' | 'graham-number' | 'graham-market' | 'buffett-statements' | 'traffic-light-flags') => {
    const today = new Date().toLocaleDateString('bg-BG');
    const target = stocks.find(s => s.ticker === selectedStockTicker) || stocks[0];
    const name = target ? `${target.companyName} (${target.ticker})` : selectedStockTicker;

    if (promptType === 'traffic-light-flags') {
      handleSendMessage(`Направи анализ на зелени, жълти и червени флагове на финансовите отчети на ${name} (Income Statement, Balance Sheet, Cash Flow).`);
    } else if (promptType === 'buffett-statements') {
      handleSendMessage(`Направи пълен одит на финансовите отчети на ${name} по книгата на Уорън Бъфет (Income Statement, Balance Sheet, Cash Flow).`);
    } else if (promptType === 'graham-audit') {
      handleSendMessage(`Провери компанията ${name} по 7-те количествени критерия на Бенджамин Греъм от Глава 14 на Интелигентният инвеститор.`);
    } else if (promptType === 'graham-number') {
      handleSendMessage(`Изчисли Числото на Греъм и стойностния модел за ${name}.`);
    } else if (promptType === 'graham-market') {
      handleSendMessage(`Обясни алегорията за Г-н Пазар (Mr. Market) от Глава 8 на Интелигентният инвеститор.`);
    } else if (promptType === 'briefing') {
      handleSendMessage('🌅 Направи ми цялостен институционален дневен пазарен брифинг');
    } else if (promptType === 'duel') {
      handleSendMessage('🥊 Сравни компанията Apple Inc. (AAPL) срещу Microsoft Corporation (MSFT)');
    } else if (promptType === 'portfolio') {
      handleSendMessage('🚀 Анализирай моето портфолио за рискове');
    } else if (promptType === 'undervalued') {
      handleSendMessage('🎯 Кои акции в таблицата са най-подценени в момента?');
    } else if (promptType === 'cash') {
      handleSendMessage('💵 Как да разпределя свободния си кеш?');
    } else if (promptType === 'company') {
      handleSendMessage(`Анализирай компанията ${name} на български език по принципите на ${INVESTOR_PERSONAS[persona].name} към дата ${today}.`);
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
          <span className="tracking-wide">AI Анализатор</span>
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Активен
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400">
                  Обединен аналитичен модел: Бъфет, Греъм, Линч, Далио и Финансови отчети
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
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

          {/* Action Success Toast */}
          {actionSuccessToast && (
            <div className="px-4 py-2 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
              <span>{actionSuccessToast}</span>
              <button onClick={() => setActionSuccessToast(null)} className="text-emerald-400 hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
                      {isAssistant ? 'AI Инвестиционен Анализатор' : 'Вие'}
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
                      <div className="flex items-center gap-1.5 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleExportReport(msg.content)}
                          className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer shadow"
                          title="Свали / Разпечатай официален PDF инвестиционен доклад"
                        >
                          <Printer className="w-3.5 h-3.5 text-indigo-400" />
                        </button>
                        <button
                          onClick={() => handleCopyMessage(msg.content, idx)}
                          className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer shadow"
                          title="Копирай анализа"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    <div className="prose prose-invert max-w-none text-xs">
                      {renderMarkdown(msg.content)}
                    </div>

                    {/* Actionable AI Buttons when stock/fair price detected */}
                    {isAssistant && (() => {
                      const actionData = detectActionsFromMessage(msg.content);
                      if (!actionData) return null;
                      return (
                        <div className="mt-3 pt-2.5 border-t border-indigo-500/20 flex items-center gap-2 flex-wrap text-[11px]">
                          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-400" /> Екшън:
                          </span>
                          {onUpdateStock && actionData.fairPrice > 0 && (
                            <button
                              onClick={() => handleApplyFairPrice(actionData.ticker, actionData.fairPrice)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1 transition-all cursor-pointer"
                              title={`Запиши $${actionData.fairPrice.toFixed(2)} като Fair Price за ${actionData.ticker}`}
                            >
                              <Edit3 className="w-3 h-3 text-emerald-400" />
                              <span>Запази Fair Price (${actionData.fairPrice.toFixed(2)})</span>
                            </button>
                          )}
                          {onAddAlert && (
                            <button
                              onClick={() => handleApplyPriceAlert(actionData.ticker, actionData.fairPrice)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 transition-all cursor-pointer"
                              title={`Добави Price Alert за ${actionData.ticker}`}
                            >
                              <Bell className="w-3 h-3 text-amber-400" />
                              <span>Задай Price Alert</span>
                            </button>
                          )}
                        </div>
                      );
                    })()}
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
                  placeholder={isRecording ? "Слушам ви на български... Говорете свободно!" : "Задайте свободен въпрос за акция, финансови отчети, пазара или натиснете микрофона..."}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none resize-none max-h-32 min-h-[46px] leading-relaxed transition-colors ${
                    isRecording ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-700 focus:border-indigo-500'
                  }`}
                  rows={2}
                />
              </div>

              {/* Voice Input Microphone Button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`h-[46px] w-[46px] rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                  isRecording
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-600/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                }`}
                title={isRecording ? 'Слушам... Натиснете за спиране' : 'Гласово въвеждане на български (Speak)'}
              >
                {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="h-[46px] px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-bold text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Изпрати</span>
              </button>
            </form>

            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 inline text-emerald-400" />
                  Верифицирани източници:
                </span>
                <a href="https://stockanalysis.com/" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline font-semibold">StockAnalysis.com</a>
                <span>•</span>
                <a href="https://www.sec.gov/edgar/searchedgar/companysearch" target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 underline font-semibold">SEC EDGAR (10-K/10-Q)</a>
                <span>•</span>
                <a href="https://www.investopedia.com/" target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300 underline font-semibold">Investopedia</a>
                <span>•</span>
                <a href="https://finance.yahoo.com/" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 underline font-semibold">Yahoo Finance</a>
                <span>•</span>
                <a href="https://fred.stlouisfed.org/" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline font-semibold">FRED</a>
              </div>
              <span className="shrink-0 text-slate-500 font-medium">Zero-Error Policy • Стойностен анализ</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
