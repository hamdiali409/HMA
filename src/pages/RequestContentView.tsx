import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { 
  Send, 
  MessageSquare, 
  Sparkles, 
  Video, 
  BookOpen, 
  Stethoscope, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';

export default function RequestContentView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    type: 'video' as 'video' | 'course' | 'case-study' | 'other'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'contentRequests'), {
        userId: user.uid,
        userEmail: user.email,
        topic: formData.topic,
        description: formData.description,
        type: formData.type,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 max-w-md w-full text-center"
        >
          <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">تم استلام طلبك!</h2>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">
            شكراً لمساهمتك في تطوير HMA. سيقوم فريقنا الطبي بمراجعة اقتراحك والعمل على توفيره في أقرب وقت ممكن.
          </p>
          <Button 
            onClick={() => navigate('/courses')}
            className="w-full py-5 shadow-blue-500/20"
          >
            العودة للمكتبة
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-sm font-black mb-6 border border-blue-100"
          >
            <Sparkles className="h-4 w-4" />
            ساهم في تطوير المحتوى
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">اطلب محتوى جديد</h1>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            هل لديك موضوع طبي معين ترغب في تعلمه؟ أو فكرة لفيديو مولد بالذكاء الاصطناعي؟ أخبرنا وسنقوم بتوفيره لك.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2">
            <motion.form 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8"
            >
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 mr-2">نوع المحتوى المطلوب</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: 'video', label: 'فيديو AI', icon: Video },
                    { id: 'course', label: 'كورس كامل', icon: BookOpen },
                    { id: 'case-study', label: 'دراسة حالة', icon: Stethoscope },
                    { id: 'other', label: 'أخرى', icon: MessageSquare }
                  ].map((type) => (
                    <Button
                      key={type.id}
                      type="button"
                      variant={formData.type === type.id ? 'primary' : 'outline'}
                      onClick={() => setFormData({ ...formData, type: type.id as any })}
                      className={`flex flex-col items-center gap-3 p-4 h-auto rounded-2xl border-2 transition-all ${
                        formData.type === type.id 
                        ? 'border-blue-600 bg-blue-50 text-blue-600' 
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <type.icon className="h-6 w-6" />
                      <span className="text-xs font-black">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="topic" className="block text-sm font-black text-slate-700 mb-3 mr-2">الموضوع أو العنوان المقترح</label>
                <input
                  id="topic"
                  type="text"
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="مثال: تشريح القلب ثلاثي الأبعاد"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-black text-slate-700 mb-3 mr-2">وصف الطلب (اختياري)</label>
                <textarea
                  id="description"
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="اشرح لنا المزيد عما تود رؤيته في هذا المحتوى..."
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium resize-none"
                ></textarea>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                variant="dark"
                className="w-full py-5 shadow-slate-200 text-lg group"
              >
                {!loading && (
                  <>
                    إرسال الطلب الآن
                    <Send className="h-5 w-5 group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] transition-transform" />
                  </>
                )}
              </Button>
            </motion.form>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <h3 className="text-2xl font-black mb-4 relative z-10">لماذا تطلب محتوى؟</h3>
              <ul className="space-y-6 relative z-10">
                {[
                  'تخصيص تجربتك التعليمية',
                  'الحصول على شروحات لمواضيع صعبة',
                  'المساهمة في إثراء المحتوى العربي',
                  'الأولوية للمواضيع الأكثر طلباً'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-bold text-blue-50">
                    <CheckCircle2 className="h-5 w-5 text-blue-200 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6">كيف نعمل؟</h3>
              <div className="space-y-8">
                {[
                  { title: 'المراجعة', desc: 'يقوم فريقنا الطبي بمراجعة طلبك' },
                  { title: 'التحضير', desc: 'نستخدم الذكاء الاصطناعي لإنشاء المحتوى' },
                  { title: 'النشر', desc: 'يتم إخطارك عند توفر المحتوى' }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center text-xs font-black border border-slate-100 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm mb-1">{step.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
