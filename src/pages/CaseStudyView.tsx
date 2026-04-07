import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { CaseStudy, Course } from '../types';
import { 
  Stethoscope, 
  ClipboardList, 
  Search, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import Button from '../components/Button';

export default function CaseStudyView() {
  const { courseId, caseStudyId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !caseStudyId) return;

      try {
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (courseDoc.exists()) setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);

        const caseDoc = await getDoc(doc(db, 'courses', courseId, 'caseStudies', caseStudyId));
        if (caseDoc.exists()) {
          setCaseStudy({ id: caseDoc.id, ...caseDoc.data() } as CaseStudy);
        } else {
          // Mock Case Study for demo
          setCaseStudy({
            id: caseStudyId,
            courseId,
            title: 'حالة سريرية: ألم صدري حاد',
            patientHistory: 'مريض يبلغ من العمر 55 عاماً، يعاني من ألم صدري ضاغط خلف القص بدأ منذ ساعتين، ينتشر إلى الفك السفلي والكتف الأيسر، مترافق مع تعرق بارد وغثيان.',
            physicalExamination: 'الضغط: 140/90، النبض: 110 منتظم، التنفس: 22، لا توجد أصوات قلبية إضافية، الرئتان صافيتان.',
            investigations: 'تخطيط القلب (ECG) يظهر ارتفاع في وصلة ST في المساري الأمامية (V1-V4). إنزيمات القلب (Troponin) مرتفعة.',
            diagnosis: 'احتشاء عضلة قلبية حاد مع ارتفاع ST (STEMI).',
            management: 'بدء العلاج بالأسبرين والكلوبيدوغريل، تحويل المريض فوراً لغرفة القسطرة القلبية لإجراء توسيع شرياني أولي.',
            references: [
              { source: 'WHO', title: 'Management of Acute Myocardial Infarction', url: 'https://www.who.int' },
              { source: 'PubMed', title: 'STEMI Guidelines 2024', url: 'https://pubmed.ncbi.nlm.nih.gov' }
            ],
            order: 1
          });
        }
      } catch (error) {
        console.error('Error fetching case study:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, caseStudyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!caseStudy) return <div className="text-center py-20">الحالة السريرية غير موجودة</div>;

  const sections = [
    { title: 'تاريخ المريض (History)', content: caseStudy.patientHistory, icon: <ClipboardList className="h-6 w-6" />, color: 'blue' },
    { title: 'الفحص السريري (Physical Exam)', content: caseStudy.physicalExamination, icon: <Stethoscope className="h-6 w-6" />, color: 'teal' },
    { title: 'الفحوصات (Investigations)', content: caseStudy.investigations, icon: <Search className="h-6 w-6" />, color: 'indigo' },
    { title: 'التشخيص (Diagnosis)', content: caseStudy.diagnosis, icon: <Activity className="h-6 w-6" />, color: 'red' },
    { title: 'الخطة العلاجية (Management)', content: caseStudy.management, icon: <CheckCircle2 className="h-6 w-6" />, color: 'green' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={`/courses/${courseId}`}>
            <Button 
              variant="ghost" 
              className="text-blue-600 mb-6 hover:gap-3 transition-all p-0 h-auto hover:bg-transparent"
            >
              <ArrowRight className="h-4 w-4" />
              العودة للكورس
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">دراسة حالة سريرية</span>
              <h1 className="text-3xl font-black text-slate-900">{caseStudy.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8">
          {sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-2xl bg-${section.color}-50 text-${section.color}-600 group-hover:scale-110 transition-transform`}>
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-black text-slate-900">{section.title}</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  {section.content}
                </p>
              </div>
            </motion.div>
          ))}

          {/* References */}
          {caseStudy.references && caseStudy.references.length > 0 && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-slate-100 p-2 rounded-xl">
                  <BookOpen className="h-5 w-5 text-slate-600" />
                </div>
                <h2 className="text-xl font-black text-slate-900">المصادر العلمية المعتمدة</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseStudy.references.map((ref, idx) => (
                  <a 
                    key={idx}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                        ref.source === 'PubMed' ? 'bg-blue-100 text-blue-700' : 
                        ref.source === 'WHO' ? 'bg-teal-100 text-teal-700' : 
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {ref.source}
                      </span>
                      <span className="text-sm font-bold text-slate-700 line-clamp-1 group-hover:text-blue-900">{ref.title}</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
