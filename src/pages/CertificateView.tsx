import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Course, UserProfile } from '../types';
import { useAuth } from '../App';
import { 
  Award, 
  Download, 
  Share2, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck,
  Calendar,
  User as UserIcon,
  FileText,
  GraduationCap
} from 'lucide-react';
import { motion } from 'motion/react';
import Button from '../components/Button';

export default function CertificateView() {
  const { courseId } = useParams();
  const { user, profile } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
        } else {
          // Mock course for demo
          setCourse({
            id: courseId,
            title: 'أساسيات علم التشريح البشري',
            description: '',
            category: 'التشريح',
            thumbnail: '',
            instructor: 'د. أحمد علي',
            price: 0,
            isFree: true
          });
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course || !profile) return <div className="text-center py-20">الشهادة غير متاحة</div>;

  const today = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const certId = `HMA-${courseId?.substring(0, 4)}-${user?.uid.substring(0, 6)}`.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="text-right">
            <h1 className="text-3xl font-black text-slate-900 mb-2">تهانينا على التميز!</h1>
            <p className="text-slate-500">لقد أتممت متطلبات الكورس بنجاح واستحققت هذه الشهادة.</p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="bg-white text-slate-700 px-6 py-3 shadow-sm"
            >
              <Share2 className="h-5 w-5" />
              مشاركة
            </Button>
            <Button 
              className="px-6 py-3 shadow-blue-200"
            >
              <Download className="h-5 w-5" />
              تحميل PDF
            </Button>
          </div>
        </div>

        {/* Certificate Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-1 md:p-4 rounded-[2rem] shadow-2xl border border-slate-200 relative overflow-hidden"
        >
          {/* Decorative Border */}
          <div className="border-8 border-double border-slate-100 rounded-[1.5rem] p-8 md:p-20 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
            </div>

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-16">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-[2rem] shadow-2xl shadow-blue-200 mb-8">
                <GraduationCap className="h-14 w-14 text-white" />
              </div>
              <div className="flex flex-col items-center mb-6">
                <h2 className="text-3xl font-black text-slate-900 leading-none tracking-tighter">HMA</h2>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.3em] mt-2">Medical Academy</span>
              </div>
              <div className="h-1.5 w-32 bg-gradient-to-r from-transparent via-blue-600 to-transparent mb-10"></div>
              <h3 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">شهادة إتمام</h3>
              <p className="text-xl text-slate-500 font-medium">تُمنح هذه الشهادة تقديراً لإتمام الكورس بنجاح</p>
            </div>

            {/* Recipient */}
            <div className="text-center mb-16">
              <p className="text-slate-400 text-lg mb-4">تشهد الأكاديمية بأن</p>
              <h4 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 border-b-2 border-slate-100 pb-4 inline-block px-12">
                {profile.displayName}
              </h4>
              <p className="text-xl text-slate-600 mt-6 leading-relaxed max-w-2xl mx-auto">
                قد اجتاز بنجاح كافة الاختبارات والمتطلبات التعليمية المقررة لكورس:
                <br />
                <span className="font-black text-blue-600 text-2xl mt-2 block">"{course.title}"</span>
              </p>
            </div>

            {/* Footer / Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-end mt-20">
              <div className="text-center">
                <div className="mb-4 h-16 flex items-center justify-center">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch%27s_Signature.png" 
                    alt="Signature" 
                    className="h-12 opacity-80 grayscale"
                  />
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <p className="font-black text-slate-900">د. هما علي</p>
                  <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">مدير الأكاديمية</p>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 bg-blue-600 rounded-full opacity-10 animate-pulse"></div>
                  <div className="absolute inset-2 border-4 border-dashed border-blue-600/30 rounded-full"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-600">
                    <ShieldCheck className="h-10 w-10 mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Verified Content</span>
                    <span className="text-[8px] font-black">HMA ACADEMY</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="mb-4 h-16 flex items-center justify-center">
                  <div className="text-slate-400 font-mono text-sm">
                    {certId}
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <p className="font-black text-slate-900">{today}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">تاريخ الإصدار</p>
                </div>
              </div>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-blue-600/20 rounded-tr-[1.5rem]"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-blue-600/20 rounded-bl-[1.5rem]"></div>
          </div>
        </motion.div>

        <div className="mt-12 text-center">
          <Link to="/dashboard">
            <Button 
              variant="ghost" 
              className="text-slate-500 hover:text-blue-600 font-bold transition-all p-0 h-auto hover:bg-transparent"
            >
              <ArrowRight className="h-4 w-4" />
              العودة للوحة التحكم
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
