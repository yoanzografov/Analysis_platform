import React from 'react';
import { 
  Lock, 
  ShieldCheck, 
  TrendingUp, 
  PieChart, 
  Sparkles, 
  CheckSquare, 
  LogIn, 
  UserPlus, 
  Zap, 
  Database,
  Sun,
  Moon
} from 'lucide-react';

interface LandingAuthGateProps {
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function LandingAuthGate({ onOpenAuth, isDark, onToggleTheme }: LandingAuthGateProps) {
  return (
    <div className="min-h-screen bg-bg text-ink font-sans flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-150 relative overflow-hidden">
      
      {/* Background Subtle Gradient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Navigation Header Bar */}
      <header className="w-full border-b border-border/80 bg-bg-card/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-ink tracking-tight uppercase">
              BULGARIAN STOCK PLATFORM
            </h1>
            <p className="text-[11px] text-ink-muted hidden sm:block">Платформа за следене на акции & фундаментален анализ</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-border bg-bg text-ink-muted hover:text-ink hover:border-indigo-500/30 transition-all cursor-pointer"
            title={isDark ? "Светла тема" : "Тъмна тема"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          <button
            onClick={() => onOpenAuth('login')}
            className="px-4 py-2 rounded-xl bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Вход</span>
          </button>

          <button
            onClick={() => onOpenAuth('signup')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Регистрация</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col items-center text-center justify-center relative z-10 space-y-12">
        
        {/* Floating Protected Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold tracking-wide uppercase animate-pulse">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>🔒 Защитена Платформа за Членове</span>
        </div>

        {/* Hero Title & Description */}
        <div className="space-y-4 max-w-3xl">
          <h2 className="text-3xl sm:text-5xl font-black text-ink tracking-tight leading-tight uppercase">
            Инвестирайте Интелигентно с <span className="text-indigo-400 underline decoration-indigo-500/40 decoration-4">Фундаментални Данни</span>
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed max-w-2xl mx-auto">
            Влезте във вашия акаунт или се регистрирайте безплатно, за да отключите пълния достъп до интерактивните финансови коефициенти, личния си портфейл и автоматичните сигнали за оценка.
          </p>
        </div>

        {/* Action CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-indigo-600/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Безплатна Регистрация</span>
          </button>

          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-bg-card hover:bg-bg-card-hover border border-border text-ink font-extrabold text-sm uppercase tracking-wider shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2.5"
          >
            <LogIn className="w-4 h-4 text-indigo-400" />
            <span>Влез в Акаунта</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full pt-8 text-left">
          
          <div className="bg-bg-card border border-border/80 rounded-2xl p-6 shadow-md hover:border-indigo-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-ink uppercase tracking-wide">Stock Checklist Table</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              54 финансови показателя с автоматично изчисляване на значки (🟢 Зелен, 🟡 Жълт, 🔴 Червен).
            </p>
          </div>

          <div className="bg-bg-card border border-border/80 rounded-2xl p-6 shadow-md hover:border-indigo-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-ink uppercase tracking-wide">Персонален Портфейл</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Автоматично синхронизиране на транзакции, позиции и дивиденти в реално време през Firebase Cloud.
            </p>
          </div>

          <div className="bg-bg-card border border-border/80 rounded-2xl p-6 shadow-md hover:border-indigo-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-ink uppercase tracking-wide">Живи Пазарни Котировки</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Интеграция с Yahoo Finance и TradingView за акции, индекси и валутни курсове.
            </p>
          </div>

          <div className="bg-bg-card border border-border/80 rounded-2xl p-6 shadow-md hover:border-indigo-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-ink uppercase tracking-wide">Защитена Сигурност</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Всеки потребител има самостоятелно криптирано пространството за личните си инвестиции.
            </p>
          </div>

        </div>

      </main>

      {/* Footer Notice */}
      <footer className="w-full border-t border-border/60 py-4 text-center text-xs text-ink-faint bg-bg-card/40">
        <div className="flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Данните в платформата са достъпни единствено за регистрирани потребители.</span>
        </div>
      </footer>

    </div>
  );
}
