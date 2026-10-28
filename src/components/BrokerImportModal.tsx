import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  RefreshCw, 
  Layers, 
  Coins, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { parseBrokerCsv, ParsedBrokerData } from '../utils/universalPortfolioParser';
import { IBKR_POSITIONS, IBKR_TRANSACTIONS, IBKR_DIVIDENDS, IBKR_CASH_BALANCE_EUR, IBKR_BASE_CURRENCY } from '../data/ibkrPortfolioData';
import { PortfolioPosition, PortfolioTransaction, PortfolioDividendRecord } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: {
    positions: PortfolioPosition[];
    transactions: PortfolioTransaction[];
    dividends: PortfolioDividendRecord[];
    cashBalance?: number;
    baseCurrency?: 'EUR' | 'USD';
    mode: 'replace' | 'merge';
  }) => void;
}

export default function BrokerImportModal({ isOpen, onClose, onImport }: Props) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedBrokerData | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedBrokerHelp, setSelectedBrokerHelp] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessText = (text: string, name = 'Ръчно въведен CSV') => {
    setErrorMessage('');
    if (!text.trim()) {
      setParsedData(null);
      return;
    }

    try {
      const result = parseBrokerCsv(text);
      if (result.summary.totalPositions === 0 && result.summary.totalTransactions === 0) {
        setErrorMessage('Не бяха открити валидни позиции или трансакции. Моля, проверете дали файлът е правилен CSV отчет.');
        setParsedData(null);
        return;
      }
      setParsedData(result);
      setFileName(name);
    } catch (e: any) {
      setErrorMessage(`Грешка при четенето: ${e.message}`);
      setParsedData(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
      setErrorMessage('Моля, изберете .csv или .txt файл.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleProcessText(content, file.name);
      }
    };
    reader.onerror = () => setErrorMessage('Възникна проблем при отварянето на файла.');
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          handleProcessText(content, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLoadPredefinedIbkr = () => {
    setParsedData({
      broker: 'Interactive Brokers',
      positions: IBKR_POSITIONS,
      transactions: IBKR_TRANSACTIONS,
      dividends: IBKR_DIVIDENDS,
      cashBalance: IBKR_CASH_BALANCE_EUR,
      baseCurrency: IBKR_BASE_CURRENCY,
      summary: {
        totalPositions: IBKR_POSITIONS.length,
        totalTransactions: IBKR_TRANSACTIONS.length,
        totalDividends: IBKR_DIVIDENDS.length,
        currencies: ['EUR', 'USD'],
        sampleTickers: IBKR_POSITIONS.map(p => p.ticker).slice(0, 8)
      }
    });
    setFileName('Запазен IBKR Activity отчет (Yoan Zografov)');
    setErrorMessage('');
  };

  const handleConfirmImport = () => {
    if (!parsedData) return;

    onImport({
      positions: parsedData.positions,
      transactions: parsedData.transactions,
      dividends: parsedData.dividends,
      cashBalance: parsedData.cashBalance,
      baseCurrency: parsedData.baseCurrency,
      mode: importMode
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border/80 flex items-center justify-between bg-bg/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-ink flex items-center gap-2">
                <span>Импорт на портфолио от брокер</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Universal CSV
                </span>
              </h2>
              <p className="text-xs text-ink-muted">
                Автоматично разпознава Interactive Brokers, Trading 212, Revolut и стандартен CSV
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-card border border-border/80 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-card-hover transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Supported Brokers Pills */}
        <div className="px-5 py-3 bg-bg/20 border-b border-border/40 flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-bold no-scrollbar">
          <span className="text-ink-faint uppercase text-[10px] tracking-wider shrink-0">Поддържани платформи:</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">Interactive Brokers</span>
            <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">Trading 212</span>
            <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">Revolut</span>
            <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Excel / Google Sheets CSV</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 custom-mini-scroll">
          {/* Method Selector Tabs */}
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-card text-ink-muted border border-border hover:text-ink'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Качване на CSV файл</span>
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'paste'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-card text-ink-muted border border-border hover:text-ink'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Поставяне на текст / код</span>
            </button>
          </div>

          {/* TAB 1: File Upload Drag & Drop */}
          {activeTab === 'upload' && (
            <div
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-500/5' 
                  : 'border-border/80 hover:border-indigo-500/50 hover:bg-card-hover'
              }`}
            >
              <input 
                ref={fileInputRef} 
                type="file" 
                accept=".csv,.txt" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-ink">
                Плъзнете вашия CSV файл тук или кликнете, за да го изберете
              </p>
              <p className="text-[11px] text-ink-faint mt-1">
                Поддържат се Activity Statement или Portfolio CSV експорти от IBKR, Trading 212, Revolut
              </p>
            </div>
          )}

          {/* TAB 2: Paste CSV Text */}
          {activeTab === 'paste' && (
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold text-ink-faint uppercase">
                Поставете съдържанието на CSV файла:
              </label>
              <textarea
                value={pastedText}
                onChange={e => {
                  setPastedText(e.target.value);
                  handleProcessText(e.target.value, 'Поставен CSV текст');
                }}
                rows={5}
                placeholder="Поставете редовете от CSV файла тук (например от отворен Notepad или Excel)..."
                className="w-full bg-bg text-ink font-mono text-xs p-3 rounded-2xl border border-border focus:outline-none focus:border-indigo-500 custom-mini-scroll"
              />
            </div>
          )}

          {/* Quick Preset: Yoan Zografov Pre-configured Statement */}
          <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-ink font-bold">
                Предварително запазен отчет (Yoan Zografov)
              </span>
            </div>
            <button
              type="button"
              onClick={handleLoadPredefinedIbkr}
              className="px-3 py-1 rounded-xl bg-card hover:bg-card-hover border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 text-xs font-extrabold cursor-pointer transition-all shrink-0"
            >
              Зареди бързо →
            </button>
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed Result Preview Card */}
          {parsedData && (
            <div className="p-4 rounded-2xl bg-card border border-emerald-500/30 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-extrabold text-ink uppercase">
                    Разпознат брокер: <strong className="text-emerald-400 font-black">{parsedData.broker}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-ink-faint">
                  {fileName}
                </span>
              </div>

              {/* Badges Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-bg border border-border/50">
                  <span className="text-ink-faint block text-[10px] uppercase font-bold">Позиции</span>
                  <span className="text-base font-black text-ink font-mono">{parsedData.summary.totalPositions}</span>
                </div>
                <div className="p-2 rounded-xl bg-bg border border-border/50">
                  <span className="text-ink-faint block text-[10px] uppercase font-bold">Трансакции</span>
                  <span className="text-base font-black text-purple-400 font-mono">{parsedData.summary.totalTransactions}</span>
                </div>
                <div className="p-2 rounded-xl bg-bg border border-border/50">
                  <span className="text-ink-faint block text-[10px] uppercase font-bold">Дивиденти</span>
                  <span className="text-base font-black text-amber-400 font-mono">{parsedData.summary.totalDividends}</span>
                </div>
              </div>

              {/* Sample Tickers Preview */}
              {parsedData.summary.sampleTickers.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-1">
                  <span className="text-ink-faint font-bold text-[10px] uppercase">Активи:</span>
                  {parsedData.summary.sampleTickers.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-bold">
                      {t}
                    </span>
                  ))}
                  {parsedData.positions.length > 8 && (
                    <span className="text-ink-faint text-[10px]">+{parsedData.positions.length - 8} още</span>
                  )}
                </div>
              )}

              {/* Import Mode: Replace vs Merge */}
              <div className="pt-2 border-t border-border/40">
                <label className="block text-[10px] font-extrabold uppercase text-ink-faint mb-1.5">
                  Режим на запис в портфолиото:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      importMode === 'replace'
                        ? 'bg-indigo-600/15 border-indigo-500 text-ink font-extrabold'
                        : 'bg-bg text-ink-muted border-border hover:text-ink'
                    }`}
                  >
                    <span className="block font-black text-indigo-400">🔄 Замени портфейла</span>
                    <span className="text-[10px] text-ink-muted">Изчиства старите и записва новите</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('merge')}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      importMode === 'merge'
                        ? 'bg-indigo-600/15 border-indigo-500 text-ink font-extrabold'
                        : 'bg-bg text-ink-muted border-border hover:text-ink'
                    }`}
                  >
                    <span className="block font-black text-emerald-400">➕ Обедини позициите</span>
                    <span className="text-[10px] text-ink-muted">Добавя към текущите ви акции</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border/80 flex items-center justify-between bg-bg/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-extrabold text-ink-muted hover:text-ink border border-border hover:bg-card-hover transition-all cursor-pointer"
          >
            Отказ
          </button>

          <button
            type="button"
            disabled={!parsedData}
            onClick={handleConfirmImport}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md ${
              parsedData
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 active:scale-95'
                : 'bg-bg text-ink-faint border border-border cursor-not-allowed opacity-50'
            }`}
          >
            <span>Зареди в моето портфолио</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
