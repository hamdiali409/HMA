import { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import Button from '../components/Button';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-950 relative overflow-hidden py-12 px-4">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent opacity-50"></div>
      
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side: Branding & Features */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block text-right"
        >
          <div className="flex items-center gap-3 mb-8 justify-end">
            <h1 className="text-4xl font-black text-white">HMA</h1>
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-5xl font-black text-white mb-8 leading-tight">
            مرحباً بك في <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-teal-300">مستقبل التعليم الطبي</span>
          </h2>
          
          <div className="space-y-6">
            {[
              { icon: <Zap className="h-5 w-5" />, title: "ذكاء اصطناعي متطور", desc: "محتوى تعليمي يواكب أحدث التقنيات العالمية." },
              { icon: <ShieldCheck className="h-5 w-5" />, title: "بيئة آمنة وموثوقة", desc: "بياناتك وتقدمك في أمان تام معنا." },
              { icon: <Globe className="h-5 w-5" />, title: "وصول من أي مكان", desc: "تعلم في أي وقت ومن أي جهاز بكل سهولة." }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 justify-end group">
                <div className="text-right">
                  <h3 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-blue-500 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-slate-900/50 backdrop-blur-2xl p-10 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            
            <div className="text-center mb-10 relative z-10">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="bg-blue-600 p-3 rounded-2xl">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-white mb-2">تسجيل الدخول</h3>
              <p className="text-slate-400">ابدأ رحلتك التعليمية الذكية اليوم</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm mb-6 text-center">
                {error}
              </div>
            )}

            <div className="space-y-4 relative z-10">
              <Button 
                onClick={handleGoogleLogin}
                isLoading={loading}
                className="w-full bg-white text-slate-900 py-5 rounded-2xl shadow-xl group"
              >
                {!loading && (
                  <>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    المتابعة باستخدام جوجل
                  </>
                )}
              </Button>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-4 text-slate-500 font-bold tracking-widest">أو</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="البريد الإلكتروني" 
                    className="w-full bg-slate-800/50 border border-slate-700 text-white px-6 py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-500 text-right"
                    disabled
                  />
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="كلمة المرور" 
                    className="w-full bg-slate-800/50 border border-slate-700 text-white px-6 py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-500 text-right"
                    disabled
                  />
                </div>
                <Button 
                  variant="outline"
                  className="w-full bg-slate-800 text-slate-400 py-5 rounded-2xl cursor-not-allowed border-slate-700 h-auto"
                  disabled
                >
                  تسجيل الدخول (قريباً)
                </Button>
              </div>
            </div>

            <div className="mt-10 text-center text-slate-500 text-sm relative z-10">
              ليس لديك حساب؟ <Link to="/login" className="text-blue-400 font-bold hover:underline">سجل الآن</Link>
            </div>
          </div>
          
          <p className="mt-8 text-center text-slate-600 text-xs px-8 leading-relaxed">
            بالاستمرار، أنت توافق على <a href="#" className="underline">شروط الخدمة</a> و <a href="#" className="underline">سياسة الخصوصية</a> الخاصة بنا.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
