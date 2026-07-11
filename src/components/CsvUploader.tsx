import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Check, AlertCircle, HelpCircle, Link2, RefreshCw } from 'lucide-react';

interface Props {
 onDataLoaded: (csvText: string) => void;
}

export default function CsvUploader({ onDataLoaded }: Props) {
 const fileInputRef = useRef<HTMLInputElement>(null);
 const [dragActive, setDragActive] = useState(false);
 const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
 const [errorMessage, setErrorMessage] = useState('');
 const [fileName, setFileName] = useState('');
 const [showHelp, setShowHelp] = useState(false);
 
 // Link Synchronization State
 const [sheetUrl, setSheetUrl] = useState('');
 const [isLoadingLink, setIsLoadingLink] = useState(false);

 const handleDrag = (e: React.DragEvent) => {
 e.preventDefault();
 e.stopPropagation();
 if (e.type === 'dragenter' || e.type === 'dragover') {
 setDragActive(true);
 } else if (e.type === 'dragleave') {
 setDragActive(false);
 }
 };

 const processFile = (file: File) => {
 if (!file.name.endsWith('.csv')) {
 setStatus('error');
 setErrorMessage('Моля, качете валиден .csv файл, експортиран от вашата Google таблица.');
 return;
 }

 setFileName(file.name);
 const reader = new FileReader();
 reader.onload = (e) => {
 const text = e.target?.result as string;
 if (text) {
 onDataLoaded(text);
 setStatus('success');
 setErrorMessage('');
 }
 };
 reader.onerror = () => {
 setStatus('error');
 setErrorMessage('Възникна грешка при четенето на файла.');
 };
 reader.readAsText(file);
 };

 const handleDrop = (e: React.DragEvent) => {
 e.preventDefault();
 e.stopPropagation();
 setDragActive(false);

 if (e.dataTransfer.files && e.dataTransfer.files[0]) {
 processFile(e.dataTransfer.files[0]);
 }
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 e.preventDefault();
 if (e.target.files && e.target.files[0]) {
 processFile(e.target.files[0]);
 }
 };

 const triggerFileInput = () => {
 fileInputRef.current?.click();
 };

 // Google Sheets Direct Live URL synchronizer
 const handleUrlSync = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!sheetUrl.trim()) return;

 setIsLoadingLink(true);
 setStatus('idle');
 setErrorMessage('');

 try {
 // Extract Google Sheet ID if pasted normal URL
 const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
 let fetchUrl = sheetUrl.trim();

 if (sheetIdMatch && sheetIdMatch[1]) {
 // Construct clean direct export URL as CSV format
 const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetIdMatch[1]}/export?format=csv`;
 // Use a CORS proxy to bypass browser restrictions
 fetchUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(exportUrl)}`;
 }

 const response = await fetch(fetchUrl);
 if (!response.ok) {
 throw new Error('Неуспешно изтегляне. Код на грешка: ' + response.status);
 }

 const text = await response.text();
 if (!text || (!text.toLowerCase().includes('ticker') && !text.toLowerCase().includes('stock') && !text.toLowerCase().includes('watch'))) {
 throw new Error('Изтегленият документ не съдържа валидна таблична структура (Watch, Ticker).');
 }

 onDataLoaded(text);
 setStatus('success');
 setFileName('Синхронизиран Гугъл линк');
 setErrorMessage('');
 } catch (err: any) {
 console.error(err);
 setStatus('error');
 setErrorMessage(
 'Грешка при връзка. Уверете се, че споделянето на таблицата в Google Sheets е настроено на "Всеки с линка може да преглежда" (Anyone with link can view).'
 );
 } finally {
 setIsLoadingLink(false);
 }
 };

 return (
 <div className="w-full bg-card rounded-2xl border border-border p-4 shadow-xs space-y-4">
 {/* Header and Help Toggle */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
 <h3 className="text-xs uppercase font-extrabold text-ink tracking-wide font-mono">
 Синхронизиране с Google Sheets & CSV данни
 </h3>
 </div>
 <button
 onClick={() => setShowHelp(!showHelp)}
 className="text-[10px] text-ink/70 hover:text-ink flex items-center gap-1 font-mono transition-colors border border-border/30 px-2 py-0.5 bg-[#D9D8D5]/40 cursor-pointer rounded-2xl"
 >
 <HelpCircle className="w-3" />
 {showHelp ? 'Скрий Помощ' : 'Инструкции'}
 </button>
 </div>

 {showHelp && (
 <div className="bg-[#D9D8D5] rounded-2xl p-3 text-xs text-ink leading-relaxed space-y-2 border border-border">
 <p className="font-bold font-serif italic text-[11px]">Два начина за синхронизиране на вашите данни от Google Sheets:</p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-mono text-ink/80">
 <div className="space-y-1 bg-card rounded-2xl p-2 border border-border/15">
 <span className="font-black text-[#10b981] block uppercase">Метод A: Чрез Линк (Препоръчително)</span>
 <p>1. В Google Sheet натиснете <span className="font-bold underline">Share</span> горе вдясно.</p>
 <p>2. Променете правата от Restricted на <span className="font-bold">"Anyone with the link"</span> (Всеки с линка може да преглежда).</p>
 <p>3. Копирайте линка на браузъра и го поставете в полето по-долу.</p>
 </div>
 
 <div className="space-y-1 bg-card rounded-2xl p-2 border border-border/15">
 <span className="font-black text-amber-800 block uppercase">Метод Б: Чрез CSV експорт</span>
 <p>1. Отидете на <span className="font-bold">File &gt; Download &gt; Comma Separated Values (.csv)</span>.</p>
 <p>2. Сваленият файл пренесете тук и го плъзнете в прекъснатото правоъгълно поле.</p>
 </div>
 </div>
 <p className="text-[9px] text-amber-400 font-mono font-bold mt-1">
 * Платформата поддържа оригиналната структура с показатели като "Fair Price" и "Current Price" и автоматично преизчислява формулите.
 </p>
 </div>
 )}

 {/* Grid containing (1) Paste URL and (2) Drag and drop */}
 <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
 
 {/* Method A: Google Sheets Link Input Box */}
 <form onSubmit={handleUrlSync} className="md:col-span-5 flex flex-col justify-between border border-border/40 p-3 bg-stone-50 rounded-2xl">
 <div>
 <span className="text-[9px] uppercase font-bold text-ink-faint tracking-wider flex items-center gap-1">
 <Link2 className="w-3 h-3 text-[#10b981]" />
 Метод А: Директен ЛИНК
 </span>
 <p className="text-[10px] text-ink-muted leading-tight mt-1 font-serif">
 Поставете споделения линк на вашата Google таблица тук за бърз live синхрон:
 </p>
 <input 
 type="url" 
 placeholder="https://docs.google.com/spreadsheets/d/..."
 value={sheetUrl}
 onChange={(e) => setSheetUrl(e.target.value)}
 className="w-full mt-2 p-1.5 text-[10px] font-mono border border-border focus:outline-none focus:bg-card rounded-2xl bg-card"
 />
 </div>

 <button
 type="submit"
 disabled={isLoadingLink || !sheetUrl.trim()}
 className={`w-full mt-3.5 py-1.5 px-3 uppercase tracking-wider text-[10px] font-mono font-bold border border-black flex items-center justify-center gap-2 rounded-2xl transition-all ${
 !sheetUrl.trim() 
 ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400' 
 : 'bg-bg text-ink hover:bg-neutral-800 cursor-pointer'
 }`}
 >
 {isLoadingLink ? (
 <>
 <RefreshCw className="w-3 h-3 animate-spin text-emerald-300" />
 Зареждане...
 </>
 ) : (
 <>
 <RefreshCw className="w-3 h-3" />
 Синхронизирай онлайн
 </>
 )}
 </button>
 </form>

 {/* Method B: Native Drag and Drop Zone */}
 <div
 onDragEnter={handleDrag}
 onDragOver={handleDrag}
 onDragLeave={handleDrag}
 onDrop={handleDrop}
 onClick={triggerFileInput}
 className={`md:col-span-7 py-4 px-3 rounded-2xl border border-dashed cursor-pointer transition-all duration-150 flex flex-col items-center justify-center text-center ${
 dragActive
 ? 'border-emerald-700 bg-emerald-700/10'
 : status === 'success'
 ? 'border-emerald-700 bg-emerald-50'
 : 'border-border/40 bg-bg/20 hover:bg-bg/45 hover:border-border'
 }`}
 >
 <input
 ref={fileInputRef}
 type="file"
 accept=".csv"
 onChange={handleChange}
 className="hidden"
 />

 {status === 'success' ? (
 <div className="flex flex-col items-center">
 <div className="p-1.5 rounded-2xl bg-emerald-700/10 text-[#10b981] mb-1.5 border border-emerald-700/40">
 <Check className="w-4 h-4" />
 </div>
 <p className="text-[11px] font-bold text-[#10b981] font-mono">Синхронизирането завърши успешно!</p>
 <p className="text-[9px] text-ink/60 mt-0.5 font-mono italic">{fileName}</p>
 </div>
 ) : status === 'error' ? (
 <div className="flex flex-col items-center p-1">
 <div className="p-1 rounded-2xl bg-[#f43f5e]/10 text-[#f43f5e] mb-1 border border-red-700/40">
 <AlertCircle className="w-4 h-4" />
 </div>
 <p className="text-[10px] font-bold text-[#f43f5e] font-mono text-center max-w-xs">{errorMessage}</p>
 <p className="text-[8.5px] text-ink/80 mt-1 hover:underline">Кликнете за да качите CSV в друг формат</p>
 </div>
 ) : (
 <div className="flex flex-col items-center">
 <div className="p-1.5 rounded-2xl bg-card border border-border/30 text-ink mb-1.5 hover:bg-[#D9D8D5] transition-colors">
 <Upload className="w-3.5 h-3.5 text-ink" />
 </div>
 <p className="text-[10px] text-ink font-bold">
 Метод Б: Плъзнете своя <span className="underline font-mono">.csv</span> файл тук
 </p>
 <p className="text-[8.5px] text-ink/55 font-mono mt-0.5 uppercase">
 ИЛИ КЛИКНЕТЕ за да изберете от компютъра
 </p>
 </div>
 )}
 </div>

 </div>
 </div>
 );
}
