import React, { useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  Search,
  Play,
  Download,
  Copy,
  Check,
  Globe,
  Cpu,
  Calendar,
  Send,
  RotateCcw,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Key,
  FileText,
} from 'lucide-react';
import { Stock } from '../types';
import { GLOBAL_TICKERS_CATALOG } from '../utils/globalTickersCatalog';

interface GeminiModelOption {
  id: string;
  label: string;
  supportsThinking: boolean;
}

interface GroundedSource {
  title: string;
  url: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  modelUsed?: string;
  groundedSources?: GroundedSource[];
}

interface Props {
  stocks: Stock[];
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-black text-ink">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1 py-0.5 rounded bg-muted/60 font-mono text-[11px] text-indigo-300">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function MarkdownReport({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={i} className="my-4 border-border/60" />);
      i++;
      continue;
    }

    // Markdown Table
    if (trimmed.startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const parseCells = (row: string) =>
        row
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map(c => c.trim());

      const headers = parseCells(tableLines[0]);
      const dataRows = tableLines.slice(2).map(parseCells);

      elements.push(
        <div key={`tbl-${i}`} className="my-3 overflow-x-auto rounded-xl border border-border/80 bg-bg/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-card/90 text-[11px] font-black uppercase tracking-wide text-ink">
                {headers.map((h, hi) => (
                  <th key={hi} className="py-2.5 px-3 whitespace-nowrap">{renderInlineMarkdown(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {dataRows.map((row, ri) => (
                <tr key={ri} className="hover:bg-indigo-500/5 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className={`py-2 px-3 ${ci === 0 ? 'font-bold text-ink' : 'text-ink-muted font-mono'}`}>
                      {renderInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-lg sm:text-xl font-black text-ink mt-5 mb-2 pb-1.5 border-b border-border/60">
          {renderInlineMarkdown(trimmed.slice(2))}
        </h1>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-base font-black text-indigo-400 mt-5 mb-2">
          {renderInlineMarkdown(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-sm font-black text-ink mt-3.5 mb-1.5">
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // Bullet / numbered lists
    if (/^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const isOrdered = /^\d+\.\s+/.test(trimmed);
      const listItems: string[] = [];
      while (
        i < lines.length &&
        (isOrdered ? /^\d+\.\s+/.test(lines[i].trim()) : /^[-*•]\s+/.test(lines[i].trim()))
      ) {
        listItems.push(lines[i].trim().replace(/^([-*•]|\d+\.)\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`list-${i}`} className={`my-2 space-y-1 pl-5 text-xs sm:text-[13px] text-ink-muted ${isOrdered ? 'list-decimal' : 'list-disc'}`}>
          {listItems.map((item, li) => (
            <li key={li} className="leading-relaxed">{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Paragraph
    elements.push(
      <p key={i} className="my-2 text-xs sm:text-[13px] text-ink-muted leading-relaxed">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

export default function AiEquityResearchView({ stocks }: Props) {
  const todayIso = new Date().toISOString().slice(0, 10);

  const [ticker, setTicker] = useState('NVDA');
  const [companyName, setCompanyName] = useState('NVIDIA Corporation');
  const [exchange, setExchange] = useState('NASDAQ');
  const [asOfDate, setAsOfDate] = useState(todayIso);

  const [models, setModels] = useState<GeminiModelOption[]>([
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Deep Thinking)', supportsThinking: true },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast Thinking)', supportsThinking: true },
    { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite (Ultra Fast)', supportsThinking: true },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', supportsThinking: false },
    { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash-Lite', supportsThinking: false },
  ]);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const [thinkingBudget, setThinkingBudget] = useState<string>('auto');
  const [enableGoogleSearch, setEnableGoogleSearch] = useState(true);

  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('gemini_user_api_key') || '';
    } catch {
      return '';
    }
  });
  const [serverHasKey, setServerHasKey] = useState<boolean>(true);
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [preparingGemini, setPreparingGemini] = useState<boolean>(false);
  const [preparedPrompt, setPreparedPrompt] = useState<string>('');
  const [promptCopiedBanner, setPromptCopiedBanner] = useState<boolean>(false);
  const [keyDraft, setKeyDraft] = useState<string>(() => {
    try {
      return localStorage.getItem('gemini_user_api_key') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    fetch('/api/ai-models', {
      headers: userApiKey ? { 'x-gemini-api-key': userApiKey } : undefined,
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (Array.isArray(data?.models) && data.models.length > 0) {
          setModels(data.models);
        }
        if (typeof data?.serverHasKey === 'boolean') {
          setServerHasKey(data.serverHasKey);
        }
      })
      .catch(() => {});
  }, [userApiKey]);

  const handleSaveApiKey = () => {
    const clean = keyDraft.trim().replace(/^["']|["']$/g, '');
    try {
      if (clean) {
        localStorage.setItem('gemini_user_api_key', clean);
      } else {
        localStorage.removeItem('gemini_user_api_key');
      }
    } catch {}
    setUserApiKey(clean);
    setShowKeyInput(false);
    setError('');
  };

  const currentModelObj = models.find(m => m.id === selectedModel);
  const isHistorical = asOfDate < todayIso;

  const suggestions = useMemo(() => {
    const q = ticker.trim().toUpperCase();
    if (!q || !searchOpen) return [];
    const fromStocks = stocks
      .filter(s => s.ticker.toUpperCase().includes(q) || s.companyName.toUpperCase().includes(q))
      .slice(0, 5)
      .map(s => ({ ticker: s.ticker, companyName: s.companyName, exchange: s.ticker.includes('.') ? 'EU/Global' : 'NASDAQ/NYSE' }));
    const seen = new Set(fromStocks.map(x => x.ticker.toUpperCase()));
    const fromCatalog = GLOBAL_TICKERS_CATALOG
      .filter(c => !seen.has(c.ticker.toUpperCase()) && (c.ticker.toUpperCase().includes(q) || c.companyName.toUpperCase().includes(q)))
      .slice(0, 5)
      .map(c => ({ ticker: c.ticker, companyName: c.companyName, exchange: c.ticker.includes('.') ? 'EU/Global' : 'NASDAQ/NYSE' }));
    return [...fromStocks, ...fromCatalog].slice(0, 7);
  }, [ticker, searchOpen, stocks]);

  const runAnalysis = async (customFollowUp?: string) => {
    if (!ticker.trim() && !companyName.trim()) {
      setError('Моля, въведете тикер или име на компания.');
      return;
    }

    setLoading(true);
    setError('');
    setSearchOpen(false);

    const isFollowUp = Boolean(customFollowUp && customFollowUp.trim());
    const parsedBudget =
      thinkingBudget === 'auto'
        ? undefined
        : Number.isFinite(Number(thinkingBudget))
          ? Number(thinkingBudget)
          : undefined;

    try {
      const res = await fetch('/api/ai-equity-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim() || ticker.trim().toUpperCase(),
          ticker: ticker.trim().toUpperCase(),
          exchange: exchange.trim(),
          asOfDate,
          model: selectedModel,
          thinkingBudget: parsedBudget,
          enableGoogleSearch: enableGoogleSearch && !isHistorical,
          history: isFollowUp ? messages.map(m => ({ role: m.role, text: m.text })) : [],
          followUpQuestion: isFollowUp ? customFollowUp!.trim() : '',
          userApiKey: userApiKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data?.code === 'API_KEY_INVALID' || String(data?.error || '').includes('API_KEY_INVALID') || String(data?.error || '').includes('API key not valid')) {
          setShowKeyInput(true);
          throw new Error('Невалиден или изтекъл Gemini API ключ. Моля, поставете валиден ключ от Google AI Studio (AIzaSy...) в полето по-горе и натиснете „Запази“.');
        }
        throw new Error(data?.error || 'Грешка при генериране на анализа.');
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        text: data.markdown || '',
        modelUsed: data.modelUsed,
        groundedSources: Array.isArray(data.groundedSources) ? data.groundedSources : [],
      };

      if (isFollowUp) {
        setMessages(prev => [...prev, { role: 'user', text: customFollowUp!.trim() }, assistantMsg]);
        setFollowUpInput('');
      } else {
        setMessages([assistantMsg]);
      }
    } catch (err: any) {
      setError(err?.message || 'Неуспешна връзка с AI сървъра.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInGeminiWindow = async () => {
    if (!ticker.trim() && !companyName.trim()) {
      setError('Моля, въведете тикер или име на компания.');
      return;
    }
    setError('');
    setPreparingGemini(true);
    setPromptCopiedBanner(false);

    // Open Google Gemini immediately inside click handler so popup blockers never block it
    window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer');

    try {
      const res = await fetch('/api/ai-equity-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim() || ticker.trim().toUpperCase(),
          ticker: ticker.trim().toUpperCase(),
          exchange: exchange.trim(),
          asOfDate,
          prepareOnly: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Грешка при подготовка на промпта.');

      const text = String(data.promptText || '');
      setPreparedPrompt(text);
      try {
        await navigator.clipboard.writeText(text);
        setPromptCopiedBanner(true);
      } catch {
        setPromptCopiedBanner(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Неуспешна подготовка на данните.');
    } finally {
      setPreparingGemini(false);
    }
  };

  const fullReportText = messages
    .filter(m => m.role === 'assistant')
    .map(m => m.text)
    .join('\n\n---\n\n');

  const handleCopy = () => {
    if (!fullReportText) return;
    navigator.clipboard.writeText(fullReportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMd = () => {
    if (!fullReportText) return;
    const blob = new Blob([fullReportText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticker || 'research'}_MASTER_4.0_${asOfDate}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!fullReportText) return;
    const escapeHtml = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const formatInline = (s: string) =>
      escapeHtml(s)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');

    const lines = fullReportText.split('\n');
    const htmlParts: string[] = [];
    let i = 0;
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t) { i++; continue; }
      if (t === '---' || t === '***') { htmlParts.push('<hr/>'); i++; continue; }
      if (t.startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
        const tbl: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tbl.push(lines[i].trim());
          i++;
        }
        const cells = (r: string) => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
        const hdr = cells(tbl[0]);
        const rows = tbl.slice(2).map(cells);
        htmlParts.push(
          `<table><thead><tr>${hdr.map(h => `<th>${formatInline(h)}</th>`).join('')}</tr></thead><tbody>${rows
            .map(r => `<tr>${r.map(c => `<td>${formatInline(c)}</td>`).join('')}</tr>`)
            .join('')}</tbody></table>`
        );
        continue;
      }
      if (t.startsWith('# ')) { htmlParts.push(`<h1>${formatInline(t.slice(2))}</h1>`); i++; continue; }
      if (t.startsWith('## ')) { htmlParts.push(`<h2>${formatInline(t.slice(3))}</h2>`); i++; continue; }
      if (t.startsWith('### ')) { htmlParts.push(`<h3>${formatInline(t.slice(4))}</h3>`); i++; continue; }
      if (/^[-*•]\s+/.test(t) || /^\d+\.\s+/.test(t)) {
        const ordered = /^\d+\.\s+/.test(t);
        const tag = ordered ? 'ol' : 'ul';
        const items: string[] = [];
        while (i < lines.length && (ordered ? /^\d+\.\s+/.test(lines[i].trim()) : /^[-*•]\s+/.test(lines[i].trim()))) {
          items.push(lines[i].trim().replace(/^([-*•]|\d+\.)\s+/, ''));
          i++;
        }
        htmlParts.push(`<${tag}>${items.map(x => `<li>${formatInline(x)}</li>`).join('')}</${tag}>`);
        continue;
      }
      htmlParts.push(`<p>${formatInline(t)}</p>`);
      i++;
    }

    const printWin = window.open('', '_blank', 'width=960,height=800');
    if (!printWin) return;
    printWin.document.write(`<!doctype html>
<html lang="bg">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(ticker || 'Analysis')} — MASTER Equity Research 4.0 (${escapeHtml(asOfDate)})</title>
  <style>
    @page { size: A4; margin: 16mm 14mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #111827; line-height: 1.55; font-size: 11.5px; margin: 0; padding: 20px; }
    .report-header { border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; }
    .report-title { font-size: 18px; font-weight: 800; color: #111827; margin: 0; }
    .report-meta { font-size: 10.5px; color: #4b5563; margin-top: 3px; }
    h1 { font-size: 15px; font-weight: 800; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin: 16px 0 8px; page-break-after: avoid; }
    h2 { font-size: 13px; font-weight: 800; color: #4338ca; margin: 14px 0 6px; page-break-after: avoid; }
    h3 { font-size: 12px; font-weight: 700; color: #1f2937; margin: 10px 0 4px; page-break-after: avoid; }
    p { margin: 5px 0; }
    ul, ol { margin: 5px 0 8px; padding-left: 18px; }
    li { margin: 2px 0; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 12px 0; }
    code { background: #f3f4f6; padding: 1px 4px; border-radius: 3px; font-family: ui-monospace, monospace; font-size: 10.5px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10.5px; page-break-inside: avoid; }
    th, td { border: 1px solid #d1d5db; padding: 5px 7px; text-align: left; }
    th { background: #f3f4f6; font-weight: 800; text-transform: uppercase; font-size: 9.5px; }
    tr:nth-child(even) td { background: #f9fafb; }
  </style>
</head>
<body>
  <div class="report-header">
    <div>
      <div class="report-title">${escapeHtml(companyName || ticker)} (${escapeHtml(ticker)})</div>
      <div class="report-meta">Борса: ${escapeHtml(exchange || '—')} · Към дата: ${escapeHtml(asOfDate)} · Модел: ${escapeHtml(selectedModel)}</div>
    </div>
    <div class="report-meta">MASTER PROMPT 4.0 · Equity Research</div>
  </div>
  ${htmlParts.join('\n')}
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 250); };</script>
</body>
</html>`);
    printWin.document.close();
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Parameter & Model Configuration Card */}
      <div className="rounded-2xl border border-border bg-card/70 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-ink">
                AI Анализ — MASTER PROMPT 4.0
              </h2>
              <p className="text-xs text-ink-muted">
                Институционален Equity Research &amp; Value Investing терминал (Buffett / Munger, 10-г. DCF, Reverse DCF, Margin of Safety)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setShowKeyInput(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                userApiKey || serverHasKey
                  ? 'border-border bg-bg hover:bg-card-hover text-ink-muted hover:text-ink'
                  : 'border-amber-500/40 bg-amber-500/15 text-amber-300'
              }`}
              title="Настройка на Gemini API ключ"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{userApiKey ? 'API Ключ ✓' : serverHasKey ? 'API Ключ' : 'Добави API Ключ'}</span>
            </button>

            {messages.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl border border-border bg-bg hover:bg-card-hover text-xs font-bold text-ink inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Копирано' : 'Копирай'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportMd}
                  className="px-3 py-1.5 rounded-xl border border-border bg-bg hover:bg-card-hover text-xs font-bold text-ink inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.MD</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/15 hover:bg-indigo-500/25 text-xs font-bold text-indigo-300 inline-flex items-center gap-1.5 cursor-pointer"
                  title="Експортирай анализа в PDF"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMessages([]); setError(''); }}
                  className="p-1.5 rounded-xl border border-border bg-bg hover:bg-card-hover text-ink-muted hover:text-ink cursor-pointer"
                  title="Изчисти анализа"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {showKeyInput && (
          <div className="p-3 rounded-xl bg-bg/80 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-bold shrink-0">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Gemini API Key:</span>
            </div>
            <input
              type="password"
              value={keyDraft}
              onChange={e => setKeyDraft(e.target.value)}
              placeholder="Постави твоя ключ от Google AI Studio (AIzaSy...)"
              className="flex-1 bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-ink font-mono focus:outline-none focus:border-amber-500/50"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer"
              >
                Запази
              </button>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg border border-border text-[11px] font-bold text-ink-muted hover:text-ink inline-flex items-center gap-1"
              >
                <span>Вземи ключ</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Ticker with autocomplete */}
          <div className="relative">
            <label className="block text-[10px] font-black uppercase text-ink-faint mb-1">Тикер *</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-faint absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={ticker}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 180)}
                onChange={e => {
                  setTicker(e.target.value.toUpperCase());
                  setSearchOpen(true);
                }}
                placeholder="NVDA, AAPL, SAP.DE..."
                className="w-full bg-bg border border-border rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-ink focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 rounded-xl bg-card border border-border shadow-2xl py-1 z-50 max-h-56 overflow-y-auto">
                {suggestions.map(s => (
                  <button
                    key={s.ticker}
                    type="button"
                    onMouseDown={() => {
                      setTicker(s.ticker);
                      setCompanyName(s.companyName);
                      setExchange(s.exchange);
                      setSearchOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-card-hover flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className="font-black text-indigo-400">{s.ticker}</span>
                    <span className="text-ink-muted truncate">{s.companyName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-[10px] font-black uppercase text-ink-faint mb-1">Компания</label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="NVIDIA Corporation"
              className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-xs font-bold text-ink focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Exchange */}
          <div>
            <label className="block text-[10px] font-black uppercase text-ink-faint mb-1">Борса</label>
            <input
              type="text"
              value={exchange}
              onChange={e => setExchange(e.target.value)}
              placeholder="NASDAQ / NYSE / XETR"
              className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-xs font-bold text-ink focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Reference Date */}
          <div>
            <label className="block text-[10px] font-black uppercase text-ink-faint mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-400" />
              <span>Към дата {isHistorical ? '(Историческа)' : '(Текуща)'}</span>
            </label>
            <input
              type="date"
              value={asOfDate}
              max={todayIso}
              onChange={e => setAsOfDate(e.target.value || todayIso)}
              className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-xs font-bold text-ink focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {/* Model Selector & Thinking Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-border/50">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-[11px] font-bold text-ink-muted whitespace-nowrap">Модел:</span>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="bg-transparent text-xs font-black text-ink outline-none cursor-pointer max-w-[240px]"
              >
                {models.map(m => (
                  <option key={m.id} value={m.id} className="bg-bg text-ink">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {currentModelObj?.supportsThinking && (
              <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-1.5">
                <span className="text-[11px] font-bold text-ink-muted whitespace-nowrap">Мислене:</span>
                <select
                  value={thinkingBudget}
                  onChange={e => setThinkingBudget(e.target.value)}
                  className="bg-transparent text-xs font-black text-amber-400 outline-none cursor-pointer"
                >
                  <option value="auto" className="bg-bg text-ink">Dynamic (Auto)</option>
                  <option value="24576" className="bg-bg text-ink">High (Max Thinking)</option>
                  <option value="8192" className="bg-bg text-ink">Medium</option>
                  <option value="1024" className="bg-bg text-ink">Low</option>
                  <option value="0" className="bg-bg text-ink">Off</option>
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={() => setEnableGoogleSearch(prev => !prev)}
              disabled={isHistorical}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                enableGoogleSearch && !isHistorical
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-bg text-ink-muted border-border'
              }`}
              title={isHistorical ? 'Изключено при историческа дата (без hindsight bias)' : 'Използвай Google Search Grounding за актуални новини и отчети'}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Search: {enableGoogleSearch && !isHistorical ? 'ВКЛ' : 'ИЗКЛ'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenInGeminiWindow}
              disabled={preparingGemini}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-black uppercase tracking-wide inline-flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 transition-all"
              title="Събира реалните данни, копира MASTER PROMPT 4.0 и отваря Google Gemini в нов прозорец (с твоя Google профил)"
            >
              {preparingGemini ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              <span>{preparingGemini ? 'Подготовка...' : 'Отвори в Google Gemini (Нов прозорец)'}</span>
            </button>

            <button
              type="button"
              onClick={() => runAnalysis()}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-black uppercase tracking-wide inline-flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/25 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{loading ? 'Анализиране...' : 'Стартирай тук (API)'}</span>
            </button>
          </div>
        </div>

        {preparedPrompt && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs font-bold text-emerald-300">
                {promptCopiedBanner
                  ? '✓ Промптът + реалните данни са копирани! Постави ги (Ctrl+V / Cmd+V) в новия прозорец на Google Gemini и избери своя модел.'
                  : 'Промптът + реалните данни са готови! Копирай и постави в новия прозорец на Google Gemini:'}
              </div>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(preparedPrompt);
                  setPromptCopiedBanner(true);
                }}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{promptCopiedBanner ? 'Копирано ✓' : 'Копирай промпта'}</span>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Output */}
      {loading && messages.length === 0 && (
        <div className="rounded-2xl border border-border bg-card/60 p-10 text-center space-y-3 shadow-xs">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <div className="text-sm font-black text-ink">
            Извличане на реални данни от Yahoo Finance / SEC EDGAR и генериране на анализ с {selectedModel}...
          </div>
          <p className="text-xs text-ink-muted">
            Пълният 17-точков институционален анализ (вкл. 10-годишен DCF и Reverse DCF) обикновено отнема 15–40 секунди.
          </p>
        </div>
      )}

      {messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-5 sm:p-6 shadow-xs ${
                msg.role === 'user'
                  ? 'border-indigo-500/30 bg-indigo-950/20'
                  : 'border-border bg-card/70'
              }`}
            >
              {msg.role === 'user' ? (
                <div className="text-xs font-bold text-indigo-300">
                  Уточняващ въпрос: <span className="text-ink font-medium">{msg.text}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {msg.modelUsed && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50 text-[11px] text-ink-faint">
                      <span>Модел: <strong className="text-indigo-400 font-mono">{msg.modelUsed}</strong></span>
                      <span>Референтна дата: <strong className="text-ink font-mono">{asOfDate}</strong></span>
                    </div>
                  )}
                  <MarkdownReport content={msg.text} />

                  {msg.groundedSources && msg.groundedSources.length > 0 && (
                    <div className="pt-3 mt-4 border-t border-border/50">
                      <div className="text-[10px] font-black uppercase text-ink-faint mb-2">Проверени източници (Google Search):</div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.groundedSources.map((src, si) => (
                          <a
                            key={si}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-bg border border-border/70 hover:border-indigo-500/40 text-[11px] font-medium text-ink-muted hover:text-indigo-400 inline-flex items-center gap-1 transition-colors"
                          >
                            <span className="truncate max-w-[200px]">{src.title || src.url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Follow-up Input Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!loading && followUpInput.trim()) runAnalysis(followUpInput);
            }}
            className="rounded-2xl border border-border bg-card/70 p-3 flex items-center gap-2 shadow-xs"
          >
            <input
              type="text"
              value={followUpInput}
              onChange={e => setFollowUpInput(e.target.value)}
              placeholder="Задай уточняващ въпрос по анализа (напр. Преизчисли DCF при WACC 10%, или Продължи с детайли)..."
              className="flex-1 bg-bg border border-border rounded-xl px-3.5 py-2 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500/50"
            />
            <button
              type="submit"
              disabled={loading || !followUpInput.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Изпрати</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
