import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  UserPlus, 
  LogIn, 
  LogOut, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Cloud, 
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  syncPin: string;
  onEnablePinSync: (pin: string) => void;
  onDisablePinSync: () => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  syncPin,
  onEnablePinSync,
  onDisablePinSync
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'pin'>(currentUser ? 'login' : 'login');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pinInput, setPinInput] = useState(syncPin);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Helper to format email if user enters plain username like "yoan"
  const formatEmail = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    if (trimmed.includes('@')) return trimmed;
    return `${trimmed.toLowerCase()}@stocktracker.app`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formattedEmail = formatEmail(emailOrUsername);
    if (!formattedEmail || !password) {
      setError('Моля попълнете имейл/потребителско име и парола!');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, formattedEmail, password);
      setSuccess('Успешен вход! Данните се синхронизират...');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Грешно потребителско име/имейл или парола!');
      } else if (err.code === 'auth/invalid-email') {
        setError('Невалиден формат на имейла!');
      } else {
        setError(err.message || 'Грешка при вход. Опитайте отново!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formattedEmail = formatEmail(emailOrUsername);
    if (!formattedEmail || !password) {
      setError('Моля попълнете всички задължителни полета!');
      return;
    }

    if (password.length < 6) {
      setError('Паролата трябва да е поне 6 символа!');
      return;
    }

    if (password !== confirmPassword) {
      setError('Паролите не съвпадат!');
      return;
    }

    try {
      setLoading(true);
      const userCred = await createUserWithEmailAndPassword(auth, formattedEmail, password);
      
      if (displayName.trim()) {
        await updateProfile(userCred.user, { displayName: displayName.trim() });
      }

      setSuccess('Акаунтът е създаден успешно! Влязохте в профила си.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Register error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Този имейл/потребителско име вече е регистриран!');
      } else if (err.code === 'auth/weak-password') {
        setError('Паролата е прекалено слаба (поне 6 символа).');
      } else {
        setError(err.message || 'Грешка при регистрация.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setSuccess('Излязохте от акаунта си.');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setError('Грешка при изход.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setError('Моля въведете PIN код!');
      return;
    }
    onEnablePinSync(pinInput.trim());
    setSuccess(`Синхронизацията с PIN (${pinInput.trim()}) е активна!`);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-card/90 border border-border/80 rounded-2xl w-full max-w-md p-6 shadow-2xl backdrop-blur-xl relative flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-ink tracking-tight">
                {currentUser ? 'Моят Акаунт & Синхронизация' : 'Вход / Регистрация в Платформата'}
              </h2>
              <p className="text-[11px] font-semibold text-ink-muted">
                Синхронизирайте портфолиото си на всички устройства (компютър, лаптоп, телефон)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-card/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Logged in state display */}
        {currentUser ? (
          <div className="py-6 space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                  Акаунтът е влязъл успешно!
                </h3>
                <p className="text-sm font-extrabold text-ink mt-1">
                  {currentUser.displayName || currentUser.email}
                </p>
                <p className="text-[11px] text-emerald-400/90 font-medium mt-0.5">
                  🟢 Автоматичната синхронизация работи в реално време на всички ваши устройства.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-extrabold text-xs rounded-xl border border-rose-500/40 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {loading ? 'Излизане...' : 'Изход от Акаунта'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-border/40 my-4 text-xs font-black">
              <button
                onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Вход
              </button>
              <button
                onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Регистрация
              </button>
              <button
                onClick={() => { setActiveTab('pin'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'pin'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                Бърз PIN
              </button>
            </div>

            {/* Error / Success Messages */}
            {error && (
              <div className="mb-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3.5 py-1">
                <div>
                  <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                    Потребителско име или Имейл
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                    <input
                      type="text"
                      placeholder="напр. yoan или yoan@example.com"
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      className="w-full bg-card/60 border border-border/70 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                    Парола
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-card/60 border border-border/70 rounded-xl py-2.5 pl-9 pr-10 text-xs font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-ink-muted hover:text-ink"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  {loading ? 'Влизане...' : 'Влез в Акаунта'}
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3 py-1">
                <div>
                  <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                    Вашето Име (опционално)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                    <input
                      type="text"
                      placeholder="напр. Йоан Зографов"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-card/60 border border-border/70 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                    Потребителско име или Имейл *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                    <input
                      type="text"
                      placeholder="напр. yoan или yoan@gmail.com"
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      className="w-full bg-card/60 border border-border/70 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                    Парола (поне 6 символа) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-card/60 border border-border/70 rounded-xl py-2 pl-9 pr-10 text-xs font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-ink-muted hover:text-ink"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                    Повтори Паролата *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-card/60 border border-border/70 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {loading ? 'Създаване...' : 'Създай Нов Акаунт'}
                </button>
              </form>
            )}

            {/* QUICK PIN TAB */}
            {activeTab === 'pin' && (
              <form onSubmit={handlePinSubmit} className="space-y-4 py-2">
                <div>
                  <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                    Личен таен PIN код (напр. 1234)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                    <input
                      type="text"
                      placeholder="Въведете PIN (напр. 1234)"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="w-full bg-card/60 border border-border/70 rounded-xl py-2.5 pl-9 pr-3 text-xs font-extrabold font-mono text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-ink-faint mt-1.5 leading-relaxed">
                    С бързия PIN синхронизирате анонимно между устройства без парола.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Cloud className="w-4 h-4" />
                    Включи PIN Синхрон
                  </button>
                  {syncPin && (
                    <button
                      type="button"
                      onClick={() => { onDisablePinSync(); onClose(); }}
                      className="py-2.5 px-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-extrabold text-xs rounded-xl border border-rose-500/40 transition-colors"
                    >
                      Изключи PIN
                    </button>
                  )}
                </div>
              </form>
            )}
          </>
        )}

      </div>
    </div>
  );
};
