import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6"
          >
            <Shield className="h-4 w-4" />
            سياسة الخصوصية الرسمية
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">خصوصيتك هي أولويتنا في HMA</h1>
          <p className="text-slate-600 text-lg">نحن نلتزم بحماية بياناتك الشخصية وتوفير بيئة تعليمية آمنة.</p>
        </div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-900">
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold m-0">1. مقدمة</h2>
              </div>
              <p>
                ترحب بكم أكاديمية HMA الطبية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك عند استخدام تطبيقنا وموقعنا الإلكتروني. باستخدامك للمنصة، فإنك توافق على الممارسات الموضحة في هذه السياسة.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-teal-600 p-2 rounded-xl">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold m-0">2. المعلومات التي نجمعها</h2>
              </div>
              <p>نحن نجمع فقط المعلومات الضرورية لتوفير تجربة تعليمية مخصصة:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li><strong>معلومات الحساب:</strong> الاسم، البريد الإلكتروني، وصورة الملف الشخصي عند التسجيل عبر جوجل.</li>
                <li><strong>بيانات التعلم:</strong> الكورسات المشترك بها، التقدم في الدروس، نتائج الاختبارات، والشهادات المحصلة.</li>
                <li><strong>تفاعلات الذكاء الاصطناعي:</strong> المحادثات مع المعلم الذكي (AI Tutor) لتحسين جودة الردود التعليمية.</li>
              </ul>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-600 p-2 rounded-xl">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold m-0">3. كيف نستخدم معلوماتك</h2>
              </div>
              <p>تستخدم HMA بياناتك للأغراض التالية:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li>توفير الوصول إلى المحتوى التعليمي والكورسات.</li>
                <li>تتبع تقدمك الأكاديمي وإصدار التقارير والشهادات.</li>
                <li>تخصيص تجربة التعلم باستخدام الذكاء الاصطناعي.</li>
                <li>إرسال تحديثات هامة حول الكورسات أو المنصة.</li>
              </ul>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-600 p-2 rounded-xl">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold m-0">4. حماية البيانات</h2>
              </div>
              <p>
                نحن نستخدم تقنيات متقدمة لحماية بياناتك، بما في ذلك خدمات **Google Firebase** المشفرة. يتم تخزين جميع البيانات بشكل آمن ولا يتم مشاركتها مع أي أطراف ثالثة لأغراض تسويقية.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-600 p-2 rounded-xl">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold m-0">5. اتصل بنا</h2>
              </div>
              <p>
                إذا كان لديك أي استفسار حول سياسة الخصوصية أو بياناتك، يمكنك التواصل معنا عبر البريد الإلكتروني:
                <br />
                <a href="mailto:support@hma-academy.com" className="text-blue-600 font-bold">support@hma-academy.com</a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-slate-400 text-sm">آخر تحديث: أبريل 2026</p>
            <Link to="/">
              <Button 
                variant="ghost" 
                className="text-blue-600 font-bold hover:gap-3 transition-all p-0 h-auto hover:bg-transparent"
              >
                العودة للرئيسية
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
