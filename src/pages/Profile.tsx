import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, Calendar, Shield, LogOut, Save, Languages } from 'lucide-react';
import Button from '../components/Button';

export default function Profile() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setUserData(data);
          setDisplayName(data.displayName || '');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName
      });
      if (userData) {
        setUserData({ ...userData, displayName });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}
      >
        <div className="bg-slate-900 p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(37,99,235,0.2),transparent_50%)]"></div>
          <div className={`relative z-10 flex flex-col md:flex-row items-center gap-8 ${i18n.language === 'ar' ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
            <div className="w-32 h-32 rounded-[2rem] bg-blue-600 flex items-center justify-center shadow-2xl border-4 border-white/10">
              <UserIcon className="h-16 w-16 text-white" />
            </div>
            <div className="text-center md:text-right flex-grow">
              <h1 className="text-3xl font-black mb-2">{userData?.displayName || user.email?.split('@')[0]}</h1>
              <p className="text-blue-400 font-bold uppercase tracking-widest text-sm">
                {userData?.role === 'admin' ? t('common.admin') : userData?.role === 'instructor' ? t('common.instructor') : t('common.student')}
              </p>
            </div>
          </div>
        </div>

        <div className="p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">
                {i18n.language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {i18n.language === 'ar' ? 'الاسم المعروض' : 'Display Name'}
                  </label>
                  <div className="relative">
                    <UserIcon className={`absolute ${i18n.language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400`} />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={`w-full ${i18n.language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-bold`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {i18n.language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className={`absolute ${i18n.language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400`} />
                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className={`w-full ${i18n.language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed outline-none font-bold`}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleUpdateProfile}
                isLoading={saving}
                className="w-full py-4 rounded-2xl shadow-blue-500/20"
              >
                <Save className="h-5 w-5" />
                {i18n.language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
              </Button>
            </div>

            <div className="space-y-8">
              <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">
                {i18n.language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {i18n.language === 'ar' ? 'تاريخ الانضمام' : 'Joined Date'}
                      </p>
                      <p className="font-bold text-slate-900">
                        {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="bg-teal-100 p-3 rounded-xl">
                      <Shield className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {i18n.language === 'ar' ? 'حالة الحساب' : 'Account Status'}
                      </p>
                      <p className="font-bold text-teal-600">
                        {i18n.language === 'ar' ? 'نشط ومعتمد' : 'Active & Verified'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={toggleLanguage}
                  className="w-full flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-100 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Languages className="h-5 w-5 text-amber-600 group-hover:text-white" />
                    </div>
                    <div className={i18n.language === 'ar' ? 'text-right' : 'text-left'}>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {i18n.language === 'ar' ? 'لغة الواجهة' : 'Interface Language'}
                      </p>
                      <p className="font-bold text-slate-900">
                        {i18n.language === 'ar' ? 'العربية' : 'English'}
                      </p>
                    </div>
                  </div>
                  <span className="text-blue-600 text-xs font-black uppercase tracking-widest">
                    {i18n.language === 'ar' ? 'تغيير' : 'Change'}
                  </span>
                </button>

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-4 p-6 bg-red-50 rounded-3xl border border-red-100 text-red-600 hover:bg-red-100 transition-all font-black"
                >
                  <LogOut className="h-5 w-5" />
                  {i18n.language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
