import { motion } from 'motion/react';
import { BookOpen, CheckCircle, Clock, GraduationCap, PlayCircle, ShieldCheck, Star, Users, Sparkles, Brain, Zap, Award, ArrowRight, Newspaper, Smartphone, Stethoscope, Microscope, Activity, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ArticleCard from '../components/ArticleCard';
import { Article } from '../types';
import Button from '../components/Button';

export default function Home() {
  const { t, i18n } = useTranslation();
  
  const features = [
    { 
      icon: <Stethoscope className="h-8 w-8" />, 
      title: t('home.feature1Title'), 
      desc: t('home.feature1Desc'),
      gradient: "from-blue-600 to-indigo-600"
    },
    { 
      icon: <Microscope className="h-8 w-8" />, 
      title: t('home.feature2Title'), 
      desc: t('home.feature2Desc'),
      gradient: "from-teal-500 to-emerald-500"
    },
    { 
      icon: <Activity className="h-8 w-8" />, 
      title: t('home.feature3Title'), 
      desc: t('home.feature3Desc'),
      gradient: "from-purple-600 to-pink-600"
    },
    { 
      icon: <HeartPulse className="h-8 w-8" />, 
      title: t('home.feature4Title'), 
      desc: t('home.feature4Desc'),
      gradient: "from-amber-500 to-orange-500"
    },
  ];

  const stats = [
    { label: i18n.language === 'ar' ? 'طالب ذكي' : 'Smart Student', value: "+10,000", icon: <Users className="h-6 w-6" /> },
    { label: i18n.language === 'ar' ? 'كورس AI' : 'AI Course', value: "+50", icon: <BookOpen className="h-6 w-6" /> },
    { label: i18n.language === 'ar' ? 'ساعة تعليمية' : 'Learning Hour', value: "+500", icon: <Clock className="h-6 w-6" /> },
    { label: i18n.language === 'ar' ? 'خريج متميز' : 'Distinguished Graduate', value: "+2,000", icon: <GraduationCap className="h-6 w-6" /> },
  ];

  const mockArticles: Article[] = [
    {
      id: 'art-1',
      title: 'مستقبل الذكاء الاصطناعي في التشخيص الطبي',
      content: 'يشهد القطاع الطبي تحولاً جذرياً بفضل تقنيات الذكاء الاصطناعي...',
      category: 'تكنولوجيا طبية',
      tags: ['AI', 'HealthTech'],
      thumbnail: 'https://picsum.photos/seed/medical-ai/800/600',
      author: 'د. أحمد علي',
      createdAt: new Date().toISOString(),
      readTime: '5 دقائق'
    },
    {
      id: 'art-2',
      title: 'أهمية التغذية السليمة لمرضى السكري',
      content: 'تلعب التغذية دوراً محورياً في إدارة مرض السكري من النوع الثاني...',
      category: 'تغذية علاجية',
      tags: ['Diabetes', 'Nutrition'],
      thumbnail: 'https://picsum.photos/seed/nutrition/800/600',
      author: 'د. سارة محمود',
      createdAt: new Date().toISOString(),
      readTime: '7 دقائق'
    },
    {
      id: 'art-3',
      title: 'تقنيات الجراحة الروبوتية الحديثة',
      content: 'أصبحت الجراحة الروبوتية خياراً مفضلاً للعديد من العمليات الدقيقة...',
      category: 'جراحة عامة',
      tags: ['Robotics', 'Surgery'],
      thumbnail: 'https://picsum.photos/seed/robotics/800/600',
      author: 'د. خالد يوسف',
      createdAt: new Date().toISOString(),
      readTime: '6 دقائق'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white py-24 lg:py-48 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(37,99,235,0.15),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500 rounded-full blur-[120px] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: i18n.language === 'ar' ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={i18n.language === 'ar' ? "text-right" : "text-left"}
            >
              <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl text-blue-400 text-sm font-black mb-10 shadow-2xl">
                <Sparkles className="h-4 w-4 animate-pulse" />
                {t('home.heroSubtitle')}
              </div>
              <h1 className="text-6xl md:text-8xl font-black leading-[1.1] mb-10 tracking-tight">
                {i18n.language === 'ar' ? (
                  <>
                    منصة <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-400 via-blue-500 to-teal-300">HMA</span> <br />
                    <span className="text-slate-200">للذكاء الطبي</span>
                  </>
                ) : (
                  <>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-teal-300">HMA</span> Platform <br />
                    <span className="text-slate-200">for Medical AI</span>
                  </>
                )}
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl leading-relaxed font-medium">
                {t('home.heroDescription')}
              </p>
              <div className={`flex flex-col sm:flex-row gap-6 ${i18n.language === 'ar' ? 'justify-start' : 'justify-start'}`}>
                <Link to="/courses">
                  <Button size="lg" className="px-12 py-8 rounded-[2rem] text-xl shadow-[0_20px_50px_rgba(37,99,235,0.3)]">
                    <BookOpen className="h-7 w-7" />
                    {t('home.startJourney')}
                  </Button>
                </Link>
                <Button variant="ghost" size="lg" className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-12 py-8 rounded-[2rem] text-xl hover:bg-white/10">
                  {t('home.viewDemo')}
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute -inset-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-[3rem] opacity-20 blur-[80px] animate-pulse"></div>
              <div className="relative bg-slate-900 rounded-[3rem] border border-white/10 p-5 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200" 
                  alt="HMA Platform" 
                  className="rounded-[2.5rem] w-full h-[600px] object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                
                {/* Floating Card */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-12 right-12 bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
                >
                  <div className="flex items-center gap-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-4 rounded-2xl shadow-lg shadow-blue-500/20">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-blue-400 font-black uppercase tracking-[0.2em] mb-2">AI Generated Content</div>
                      <div className="text-2xl font-black text-white">محتوى ذكي متطور</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-950 py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="flex justify-center mb-6 text-slate-600 group-hover:text-blue-500 transition-all duration-500 group-hover:scale-110">
                  {stat.icon}
                </div>
                <div className="text-5xl font-black text-white mb-3 tracking-tight">{stat.value}</div>
                <div className="text-xs text-slate-500 font-black uppercase tracking-[0.3em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-40 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,_rgba(37,99,235,0.03),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-32">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-blue-600 font-black uppercase tracking-[0.4em] text-sm mb-6 block"
            >
              {t('home.featuresSubtitle')}
            </motion.span>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">
              {i18n.language === 'ar' ? (
                <>لماذا تختار <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">HMA</span>؟</>
              ) : (
                <>Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">HMA</span>?</>
              )}
            </h2>
            <p className="text-slate-500 text-xl max-w-3xl mx-auto leading-relaxed font-medium">{t('home.featuresDescription')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -15 }}
                className={`bg-white p-12 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 ${i18n.language === 'ar' ? 'text-right' : 'text-left'} group transition-all duration-500 hover:shadow-[0_40px_80px_rgba(37,99,235,0.08)]`}
              >
                <div className={`bg-gradient-to-br ${feature.gradient} w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-40 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="text-right">
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-blue-600 font-black uppercase tracking-[0.4em] text-sm mb-6 block"
              >
                المدونة الطبية
              </motion.span>
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight">آخر المقالات والأخبار</h2>
            </div>
            <Link to="/articles">
              <Button variant="secondary" className="px-8 py-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all font-black text-slate-900">
                عرض كل المقالات
                <ArrowRight className="h-5 w-5 group-hover:translate-x-[-4px] transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {mockArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Request Content CTA */}
      <section className="py-40 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,_rgba(37,99,235,0.03),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[4rem] p-16 md:p-32 text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full translate-y-1/2 -translate-x-1/2 opacity-10 blur-[120px]"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-2xl text-blue-400 text-sm font-black mb-12 shadow-2xl">
                <Sparkles className="h-5 w-5 animate-pulse" />
                هل لديك موضوع طبي معين؟
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tight leading-tight">اطلب محتوى طبي مخصص بالذكاء الاصطناعي</h2>
              <p className="text-slate-400 text-2xl mb-16 max-w-3xl mx-auto font-medium leading-relaxed">
                نحن نستخدم أحدث تقنيات الذكاء الاصطناعي لإنشاء فيديوهات وشروحات طبية دقيقة. إذا لم تجد ما تبحث عنه، اطلبه الآن وسنقوم بتوفيره خصيصاً لك.
              </p>
              <Link to="/request-content">
                <Button size="lg" className="px-16 py-10 rounded-[2.5rem] text-2xl shadow-[0_20px_50px_rgba(37,99,235,0.4)]">
                  اطلب محتوى الآن
                  <ArrowRight className="h-8 w-8 group-hover:translate-x-[-8px] transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Download App Section */}
      <section className="py-20 bg-blue-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-right text-white">
              <h2 className="text-4xl font-black mb-4 tracking-tight">حمّل تطبيق HMA الآن</h2>
              <p className="text-blue-100 text-lg font-medium">احصل على تجربة تعليمية أسرع وأفضل مباشرة من شاشتك الرئيسية.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="secondary"
                size="lg"
                onClick={() => {
                  const event = new Event('beforeinstallprompt');
                  window.dispatchEvent(event);
                }}
                className="bg-white text-blue-600 hover:bg-blue-50 transition-all shadow-xl"
              >
                <Smartphone className="h-6 w-6" />
                تثبيت التطبيق
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-slate-950 rounded-[4rem] p-16 md:p-32 text-center text-white relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.2)]"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500 rounded-full translate-y-1/2 -translate-x-1/2 opacity-10 blur-[120px]"></div>
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl font-black mb-10 leading-tight tracking-tight">ابدأ عصر التعلم الذكي</h2>
              <p className="text-slate-400 mb-16 text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
                انضم إلى المنصة التي تعيد تعريف التعليم الطبي في العالم العربي. سجل الآن مجاناً واحصل على شهاداتك المعتمدة.
              </p>
              <Link to="/courses">
                <Button size="lg" className="px-16 py-10 rounded-[2.5rem] text-2xl shadow-[0_20px_50px_rgba(37,99,235,0.4)]">
                  سجل الآن مجاناً
                  <CheckCircle className="h-8 w-8" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
