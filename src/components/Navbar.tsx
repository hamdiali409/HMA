import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuth } from '../App';
import { BookOpen, LayoutDashboard, LogOut, LogIn, GraduationCap, Menu, X, Sparkles, ShieldAlert, Smartphone, Languages } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import NotificationManager from './NotificationManager';
import Button from './Button';
import Logo from './Logo';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('التطبيق متاح للتحميل من خلال متصفح كروم: اضغط على الثلاث نقاط ثم "Install App" أو "Add to Home Screen"');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-3 group">
              <Logo />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/courses" className="text-slate-600 hover:text-blue-600 font-bold transition-colors flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t('common.courses')}
            </Link>
            {user && (
              <Link to="/dashboard" className="text-slate-600 hover:text-blue-600 font-bold transition-colors flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                {t('common.dashboard')}
              </Link>
            )}
            {(profile?.role === 'admin' || profile?.role === 'instructor') && (
              <Link to="/admin" className="text-purple-600 hover:text-purple-700 font-bold transition-colors flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-xl">
                <ShieldAlert className="h-4 w-4" />
                {profile?.role === 'admin' ? (i18n.language === 'ar' ? 'الإدارة' : 'Admin') : (i18n.language === 'ar' ? 'إدارة المحتوى' : 'Instructor')}
              </Link>
            )}
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleInstall}
              className="font-bold"
            >
              <Smartphone className="h-4 w-4" />
              {i18n.language === 'ar' ? 'تحميل التطبيق' : 'Install App'}
            </Button>
            <Link to="/request-content" className="text-slate-600 hover:text-blue-600 font-bold transition-colors flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              {t('common.requestContent')}
            </Link>
            
            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-2 font-bold text-blue-600 hover:bg-blue-50"
            >
              <Languages className="h-4 w-4" />
              {i18n.language === 'ar' ? 'English' : 'العربية'}
            </Button>

            {user ? (
              <div className="flex items-center gap-6">
                <NotificationManager />
                <Link to="/profile" className={`flex flex-col ${i18n.language === 'ar' ? 'items-end' : 'items-start'} hover:text-blue-600 transition-colors`}>
                  <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600">{profile?.displayName}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    {profile?.role === 'admin' ? (i18n.language === 'ar' ? 'مدير المنصة' : 'Platform Admin') : profile?.role === 'instructor' ? (i18n.language === 'ar' ? 'مدرب معتمد' : 'Certified Instructor') : (i18n.language === 'ar' ? 'طالب' : 'Student')}
                  </span>
                </Link>
                <Button 
                  onClick={handleLogout}
                  variant="secondary"
                  size="icon"
                  title={t('common.logout')}
                  className="h-10 w-10 rounded-xl"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="px-8 py-3 shadow-blue-100">
                  <LogIn className="h-4 w-4" />
                  {t('common.login')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-slate-600 h-10 w-10 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              <Link to="/courses" onClick={() => setIsMenuOpen(false)} className="text-slate-600 py-2">{t('common.courses')}</Link>
              {user && <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-slate-600 py-2">{t('common.dashboard')}</Link>}
              {user && <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-slate-600 py-2">{i18n.language === 'ar' ? 'الملف الشخصي' : 'Profile'}</Link>}
              <Link to="/request-content" onClick={() => setIsMenuOpen(false)} className="text-slate-600 py-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                {t('common.requestContent')}
              </Link>
              <Button
                variant="ghost"
                onClick={toggleLanguage}
                className="justify-start font-bold text-blue-600"
              >
                <Languages className="h-4 w-4" />
                {i18n.language === 'ar' ? 'English' : 'العربية'}
              </Button>
              {user ? (
                <Button onClick={handleLogout} variant="danger" className="w-full justify-start">
                  <LogOut className="h-4 w-4" />
                  {t('common.logout')}
                </Button>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">{t('common.login')}</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
