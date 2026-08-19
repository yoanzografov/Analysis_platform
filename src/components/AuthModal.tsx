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
  EyeOff,
  Send
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(currentUser ? 'login' : 'login');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
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

  const isRealEmail = (input: string) => {
    const formatted = formatEmail(input);
    return formatted.includes('@') && !formatted.endsWith('@stocktracker.app');
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
      } else if (err.code === 'auth/configuration-not-found') {
        setError('Моля активирайте "Email/Password" във Firebase Console (Authentication -> Sign-in method -> Enable) или ползвайте бързия PIN.');
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

      // Send verification email if it's a real email address
      if (isRealEmail(emailOrUsername)) {
        try {
          await sendEmailVerification(userCred.user);
          setSuccess('Акаунтът е създаден! Изпратихме имейл за потвърждение.');
        } catch (emailErr) {
          console.warn("Could not send email verification:", emailErr);
          setSuccess('Акаунтът е създаден успешно!');
        }
      } else {
        setSuccess('Акаунтът е създаден успешно! Влязохте в профила си.');
      }

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error("Register error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Този имейл/потребителско име вече е регистриран!');
      } else if (err.code === 'auth/weak-password') {
        setError('Паролата е прекалено слаба (поне 6 символа).');
      } else if (err.code === 'auth/configuration-not-found') {
        setError('Моля активирайте "Email/Password" във Firebase Console (Authentication -> Sign-in method -> Enable).');
      } else {
        setError(err.message || 'Грешка при регистрация.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formattedEmail = formatEmail(emailOrUsername);
    if (!formattedEmail) {
      setError('Моля въведете Вашия имейл!');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, formattedEmail);
      setSuccess('Изпратихме ви имейл с инструкции за възстановяване на паролата!');
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === 'auth/user-not-found') {
        setError('Не открихме акаунт с този имейл.');
      } else {
        setError('Грешка при изпращане на имейла.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError('');
      await sendEmailVerification(currentUser);
      setSuccess('Потвърдителният имейл е изпратен отново! Проверете пощата си.');
    } catch (err: any) {
      console.error("Resend verification error:", err);
      setError('Грешка при изпращане на писмото.');
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


  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-bg border border-border rounded-3xl w-full max-w-md p-4 sm:p-6 shadow-2xl relative flex flex-col my-auto max-h-[92vh] overflow-y-auto scroll-smooth">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-ink tracking-tight">
                {currentUser ? 'Моят Акаунт & Синхронизация' : 'Вход / Регистрация в Профила'}
              </h2>
              <p className="text-[11px] font-semibold text-ink-muted leading-tight">
                Защитено портфолио и синхронизация на всички устройства
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-ink-muted hover:text-ink hover:bg-card transition-colors cursor-pointer shrink-0"
            title="Затвори"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Logged in state display */}
        {currentUser ? (
          <div className="py-4 sm:py-6 space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
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
                {currentUser.email && !currentUser.email.endsWith('@stocktracker.app') && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-500/20 text-[11px]">
                    {currentUser.emailVerified ? (
                      <span className="text-emerald-300 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Имейлът е потвърден
                      </span>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-amber-300 font-medium">Очаква потвърждение</span>
                        <button
                          type="button"
                          onClick={handleResendVerificationEmail}
                          disabled={loading}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg font-bold border border-amber-500/30 transition-all text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          Изпрати имейл отново
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full py-3 px-4 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-extrabold text-xs rounded-xl border border-rose-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
              >
                <LogOut className="w-4 h-4" />
                {loading ? 'Излизане...' : 'Изход от Акаунта'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Primary Login / Register Tabs */}
            <div className="flex border-b border-border/40 my-3.5 text-xs font-black shrink-0">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase ${
                  activeTab === 'login' || activeTab === 'forgot'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-xl font-black'
                    : 'border-transparent text-ink-muted hover:text-ink font-bold'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Вход с Имейл</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase ${
                  activeTab === 'register'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-xl font-black'
                    : 'border-transparent text-ink-muted hover:text-ink font-bold'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Нова Регистрация</span>
              </button>
            </div>

            {/* Error / Success Messages */}
            {error && (
              <div className="mb-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3.5 py-1">
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                    Имейл или Потребителско име
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                    <input
                      type="text"
                      placeholder="напр. yoan@gmail.com или yoan"
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl py-2.5 pl-9 pr-3 text-sm font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                      Парола
                    </label>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('forgot'); setError(''); setSuccess(''); }}
                      className="text-xs font-bold text-indigo-400 hover:underline"
                    >
                      Забравена парола?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl py-2.5 pl-9 pr-10 text-sm font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-ink-muted hover:text-ink cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  {loading ? 'Влизане...' : 'Влез в Акаунта'}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {activeTab === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-3.5 py-1">
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                    Вашият Имейл адрес
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                    <input
                      type="email"
                      placeholder="напр. yoan@gmail.com"
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl py-2.5 pl-9 pr-3 text-sm font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  <p className="text-xs text-ink-muted mt-1.5">
                    Ще ви изпратим линк за смяна на паролата в пощата.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="py-3 px-4 bg-card border border-border text-ink font-bold text-xs rounded-xl hover:bg-card-hover transition-colors cursor-pointer"
                  >
                    Назад
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Изпращане...' : 'Изпрати линк'}
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5 py-1">
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                    Вашето Име (опционално)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                    <input
                      type="text"
                      placeholder="напр. Йоан Зографов"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl py-2.5 pl-9 pr-3 text-sm font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                    Имейл адрес или Потребителско име *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                    <input
                      type="text"
                      placeholder="напр. yoan@gmail.com или yoan"
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl py-2.5 pl-9 pr-3 text-sm font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                    Парола (поне 6 символа) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl py-2.5 pl-9 pr-10 text-sm font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-ink-muted hover:text-ink cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                    Повтори Паролата *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl py-2.5 pl-9 pr-3 text-sm font-bold text-ink placeholder:text-ink-faint focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  {loading ? 'Създаване...' : 'Създай Нов Акаунт'}
                </button>
              </form>
            )}

          </>
        )}

      </div>
    </div>
  );
};
