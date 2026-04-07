import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Course, Lesson, Quiz, Progress, CaseStudy } from '../types';
import { useAuth } from '../App';
import Button from '../components/Button';
import Rating from '../components/Rating';
import { 
  PlayCircle, 
  FileText, 
  HelpCircle, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  ChevronLeft, 
  Lock,
  ArrowRight,
  Stethoscope,
  Sparkles,
  Award,
  ShieldCheck,
  Zap,
  Brain,
  Eye,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;

      try {
        // Fetch Course
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (courseDoc.exists()) {
          const data = courseDoc.data();
          setCourse({ id: courseDoc.id, ...data } as Course);
        } else {
          // Mock course for demo if not found
          setCourse({
            id: courseId,
            title: 'أساسيات علم التشريح البشري (AI Enhanced)',
            description: 'كورس شامل يغطي جميع أجهزة الجسم البشري مع شرح مفصل للعظام والعضلات والأعصاب. ستتعلم في هذا الكورس كيفية التعرف على الأجزاء المختلفة للجسم البشري ووظائفها الأساسية باستخدام تقنيات الذكاء الاصطناعي.',
            category: 'التشريح',
            thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=1000',
            instructor: 'د. أحمد علي',
            price: 299,
            isFree: false,
            rating: 4.9,
            ratingCount: 120
          });
        }

        // Fetch Lessons
        const lessonsSnapshot = await getDocs(collection(db, 'courses', courseId, 'lessons'));
        const lessonsData = lessonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
        
        if (lessonsData.length === 0) {
          setLessons([
            { id: 'l1', courseId, title: 'مقدمة في علم التشريح الذكي', content: 'محتوى الدرس الأول يغطي الأساسيات التاريخية لعلم التشريح وكيف تطور عبر العصور ليصل إلى ما هو عليه اليوم من دقة ومحاكاة رقمية...', order: 1, videoType: 'ai-generated', isPreviewable: true },
            { id: 'l2', courseId, title: 'الجهاز العظمي - محاكاة 3D', content: 'محتوى الدرس الثاني...', order: 2, videoType: 'ai-generated' },
            { id: 'l3', courseId, title: 'الجهاز العضلي وتصنيف العضلات', content: 'محتوى الدرس الثالث...', order: 3, videoType: 'standard' },
          ]);
        } else {
          setLessons(lessonsData.sort((a, b) => a.order - b.order));
        }

        // Fetch Quizzes
        const quizzesSnapshot = await getDocs(collection(db, 'courses', courseId, 'quizzes'));
        const quizzesData = quizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
        
        if (quizzesData.length === 0) {
          setQuizzes([{ id: 'q1', courseId, title: 'اختبار تقييمي للوحدة الأولى', questions: [], type: 'mcq' }]);
        } else {
          setQuizzes(quizzesData);
        }

        // Fetch Case Studies
        const caseStudiesSnapshot = await getDocs(collection(db, 'courses', courseId, 'caseStudies'));
        const caseStudiesData = caseStudiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CaseStudy));
        
        if (caseStudiesData.length === 0) {
          setCaseStudies([{ 
            id: 'cs1', 
            courseId, 
            title: 'حالة سريرية: ألم صدري حاد', 
            patientHistory: '', 
            physicalExamination: '', 
            investigations: '', 
            diagnosis: '', 
            management: '', 
            order: 1 
          }]);
        } else {
          setCaseStudies(caseStudiesData.sort((a, b) => a.order - b.order));
        }

        // Fetch Progress if logged in
        if (user) {
          const progressQuery = query(
            collection(db, 'progress'), 
            where('userId', '==', user.uid),
            where('courseId', '==', courseId)
          );
          const progressSnapshot = await getDocs(progressQuery);
          if (!progressSnapshot.empty) {
            setProgress({ id: progressSnapshot.docs[0].id, ...progressSnapshot.docs[0].data() } as Progress);
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `courses/${courseId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      const progressId = `${user.uid}_${courseId}`;
      const newProgress: Progress = {
        id: progressId,
        userId: user.uid,
        courseId: courseId!,
        completedLessons: [],
        quizScores: {},
        lastAccessed: new Date().toISOString()
      };
      await setDoc(doc(db, 'progress', progressId), newProgress);
      setProgress(newProgress);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `progress/${user.uid}_${courseId}`);
    } finally {
      setEnrolling(false);
    }
  };

  const handleRate = async (newRating: number) => {
    if (!user || !course || !courseId) return;

    setRatingLoading(true);
    try {
      const currentRating = course.rating || 0;
      const currentCount = course.ratingCount || 0;
      
      const newCount = currentCount + 1;
      const newAverage = ((currentRating * currentCount) + newRating) / newCount;

      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        rating: Number(newAverage.toFixed(1)),
        ratingCount: newCount
      });

      setCourse({
        ...course,
        rating: Number(newAverage.toFixed(1)),
        ratingCount: newCount
      });
      setUserRating(newRating);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `courses/${courseId}`);
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) return <div className="text-center py-20">الكورس غير موجود</div>;

  const isCompleted = progress && (progress.completedLessons.length >= lessons.length);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Header */}
      <div className="bg-slate-950 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(37,99,235,0.15),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/courses" className="inline-flex items-center gap-2 text-blue-400 mb-10 hover:gap-3 transition-all font-bold">
            <ArrowRight className="h-5 w-5" />
            العودة لمكتبة الكورسات
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
            <div className="lg:col-span-2 text-right">
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">
                  {course.category}
                </span>
                <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-xl border border-amber-500/20">
                  <Rating initialRating={course.rating || 0} readonly size="sm" />
                  <span className="text-sm font-black">({course.ratingCount || 0} تقييم)</span>
                </div>
                <div className="flex items-center gap-2 text-teal-400 bg-teal-400/10 px-4 py-1.5 rounded-xl border border-teal-400/20">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-black">AI Enhanced Content</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
                {course.title}
              </h1>
              
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/30">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`} 
                    alt={course.instructor}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">بواسطة</span>
                  <span className="text-white font-black text-lg">{course.instructor}</span>
                </div>
              </div>

              <p className="text-slate-400 text-xl mb-12 leading-relaxed max-w-3xl font-medium">
                {course.description}
              </p>
              
              <div className="flex flex-wrap gap-8 text-slate-300 text-sm font-bold">
                <div className="flex items-center gap-3">
                  <div className="bg-white/5 p-2 rounded-lg"><Users className="h-5 w-5 text-blue-500" /></div>
                  <span>+1,200 طالب مسجل</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/5 p-2 rounded-lg"><Clock className="h-5 w-5 text-blue-500" /></div>
                  <span>12 ساعة تعليمية</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/5 p-2 rounded-lg"><Award className="h-5 w-5 text-blue-500" /></div>
                  <span>شهادة إتمام معتمدة</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden sticky top-24"
              >
                <div className="relative">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-64 object-cover opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  <div className="absolute bottom-6 right-6">
                    <div className="bg-blue-600 p-4 rounded-2xl shadow-xl">
                      <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="p-10">
                  <div className="flex items-baseline gap-3 mb-8">
                    <span className="text-5xl font-black text-white">
                      {course.isFree ? 'مجاني' : `${course.price} ر.س`}
                    </span>
                    {!course.isFree && <span className="text-slate-500 line-through text-xl">599 ر.س</span>}
                  </div>
                  
                  {progress ? (
                    <div className="space-y-4">
                      <Link to={`/courses/${courseId}/lessons/${lessons[0]?.id}`}>
                        <Button className="w-full text-lg py-5 rounded-2xl shadow-blue-500/20">
                          متابعة التعلم
                        </Button>
                      </Link>
                      {isCompleted && (
                        <Link to={`/courses/${courseId}/certificate`}>
                          <Button variant="dark" className="w-full text-lg py-5 rounded-2xl shadow-teal-500/20 bg-teal-600 hover:bg-teal-700">
                            <Award className="h-6 w-6" />
                            عرض الشهادة المعتمدة
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <Button 
                      onClick={handleEnroll}
                      disabled={enrolling}
                      isLoading={enrolling}
                      className="w-full text-lg py-5 rounded-2xl shadow-blue-500/20"
                    >
                      سجل في الكورس الآن
                    </Button>
                  )}
                  
                  <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                      <ShieldCheck className="h-5 w-5 text-teal-500" />
                      <span>ضمان استرداد الأموال خلال 30 يوم</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                      <Zap className="h-5 w-5 text-blue-500" />
                      <span>وصول مدى الحياة للمحتوى</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black text-slate-900">محتوى الكورس الذكي</h2>
              <div className="text-sm text-slate-500 font-bold bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                {lessons.length} دروس • {quizzes.length} اختبارات
              </div>
            </div>
            
            <div className="space-y-6">
              {lessons.map((lesson, idx) => (
                <motion.div 
                  key={lesson.id}
                  whileHover={progress ? { x: -10 } : {}}
                  className={`bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between group transition-all shadow-sm ${progress ? 'hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5' : 'opacity-75'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className="bg-slate-50 text-slate-400 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                      {progress?.completedLessons.includes(lesson.id) ? <CheckCircle className="h-6 w-6" /> : idx + 1}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-black text-slate-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">{lesson.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="h-3.5 w-3.5" /> 15 دقيقة
                        </span>
                        {lesson.pdfUrl && (
                          <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                            <FileText className="h-3.5 w-3.5" /> ملخص PDF
                          </span>
                        )}
                        {lesson.videoType === 'ai-generated' && (
                          <span className="flex items-center gap-1.5 text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg">
                            <Sparkles className="h-3.5 w-3.5" /> ذكاء اصطناعي
                          </span>
                        )}
                        {lesson.isPreviewable && !progress && (
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              setPreviewLesson(lesson);
                            }}
                            className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" /> عرض تجريبي
                          </button>
                        )}
                        {progress?.lessonProgress?.[lesson.id] && !progress.completedLessons.includes(lesson.id) && (
                          <div className="flex items-center gap-3 text-blue-600 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100">
                            <div className="w-20 h-2 bg-blue-100 rounded-full overflow-hidden">
                              <div 
                                className="bg-blue-600 h-full transition-all duration-500" 
                                style={{ width: `${(progress.lessonProgress[lesson.id].currentTime / progress.lessonProgress[lesson.id].duration) * 100}%` }}
                              ></div>
                            </div>
                            <span className="whitespace-nowrap">متابعة المشاهدة</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {progress ? (
                    <Link 
                      to={`/courses/${courseId}/lessons/${lesson.id}`}
                      className="bg-slate-50 text-slate-400 p-3 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Link>
                  ) : (
                    <Lock className="h-6 w-6 text-slate-200" />
                  )}
                </motion.div>
              ))}

              {caseStudies.map((cs) => (
                <motion.div 
                  key={cs.id}
                  whileHover={progress ? { x: -10 } : {}}
                  className={`bg-teal-50/50 p-6 rounded-3xl border border-teal-100 flex items-center justify-between group transition-all shadow-sm ${progress ? 'hover:border-teal-300 hover:shadow-xl hover:shadow-teal-500/5' : 'opacity-75'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className="bg-teal-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/20">
                      <Stethoscope className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-teal-900 text-lg mb-2">{cs.title}</h3>
                      <span className="text-xs font-black text-teal-600 uppercase tracking-widest">دراسة حالة سريرية متقدمة</span>
                    </div>
                  </div>
                  
                  {progress ? (
                    <Link 
                      to={`/courses/${courseId}/case-studies/${cs.id}`}
                      className="bg-teal-600 text-white p-3 rounded-2xl shadow-lg shadow-teal-600/20 transition-all duration-500"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Link>
                  ) : (
                    <Lock className="h-6 w-6 text-teal-200" />
                  )}
                </motion.div>
              ))}

              {quizzes.map((quiz) => (
                <motion.div 
                  key={quiz.id}
                  whileHover={progress ? { x: -10 } : {}}
                  className={`bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-center justify-between group transition-all shadow-sm ${progress ? 'hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5' : 'opacity-75'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                      <HelpCircle className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-blue-900 text-lg mb-2">{quiz.title}</h3>
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                        {quiz.type === 'case-based' ? 'اختبار دراسة حالة' : 'اختبار تقييمي MCQ'}
                      </span>
                    </div>
                  </div>
                  
                  {progress ? (
                    <Link 
                      to={`/courses/${courseId}/quizzes/${quiz.id}`}
                      className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-600/20 transition-all duration-500"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Link>
                  ) : (
                    <Lock className="h-6 w-6 text-blue-200" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-blue-100 border-2 border-blue-50 shadow-inner">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`} 
                        alt={course.instructor}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white p-1.5 rounded-lg shadow-lg border-2 border-white">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl mb-1">{course.instructor}</h3>
                    <p className="text-blue-600 text-xs font-black uppercase tracking-widest">مدرب معتمد لدى HMA</p>
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  خبير في {course.category} مع أكثر من 10 سنوات من الخبرة في التعليم الطبي والتدريب السريري.
                </p>
              </div>

              {progress && (
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-amber-500 p-3 rounded-xl shadow-lg shadow-amber-600/20">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-black text-slate-900 text-xl">قيم هذا الكورس</h3>
                  </div>
                  <p className="text-slate-500 text-sm mb-6 font-medium">رأيك يهمنا ويساعدنا في تحسين المحتوى التعليمي.</p>
                  <div className="flex flex-col items-center gap-4">
                    <Rating 
                      initialRating={userRating} 
                      onRate={handleRate} 
                      readonly={ratingLoading || userRating > 0}
                      size="lg"
                    />
                    {userRating > 0 && (
                      <span className="text-teal-600 text-xs font-black uppercase tracking-widest">شكراً لتقييمك!</span>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-600/20">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-black text-slate-900 text-xl">ماذا ستتعلم؟</h3>
                </div>
                <ul className="space-y-6">
                  {[
                    'فهم شامل لتشريح أجهزة الجسم المختلفة',
                    'القدرة على التعرف على الهياكل العظمية والعضلية',
                    'ربط التشريح بالوظائف الحيوية والسريرية',
                    'الاستعداد للاختبارات الأكاديمية والمهنية'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-base text-slate-600 font-medium leading-relaxed">
                      <CheckCircle className="h-6 w-6 text-teal-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 blur-2xl"></div>
                <div className="relative z-10">
                  <Award className="h-12 w-12 text-blue-400 mb-6" />
                  <h3 className="text-2xl font-black mb-4">شهادة معتمدة</h3>
                  <p className="text-slate-400 mb-8 leading-relaxed font-medium">
                    عند إتمامك للكورس واجتياز الاختبارات، ستحصل على شهادة بختم وإمضاء معتمد من HMA يمكنك مشاركتها في سيرتك الذاتية.
                  </p>
                  <div className="flex items-center gap-3 text-blue-400 font-black">
                    <ShieldCheck className="h-5 w-5" />
                    <span>توثيق رسمي من الأكاديمية</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Preview Modal */}
      <AnimatePresence>
        {previewLesson && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewLesson(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-100 p-3 rounded-2xl">
                    <Eye className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{previewLesson.title}</h3>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">عرض تجريبي مجاني</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPreviewLesson(null)}
                  className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto flex-grow prose prose-slate max-w-none">
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8 flex items-start gap-4">
                  <Sparkles className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <p className="text-blue-900 text-sm font-medium leading-relaxed m-0">
                    هذا عرض تجريبي لمحتوى الدرس. سجل في الكورس الآن للوصول إلى المحتوى الكامل، الفيديوهات، الاختبارات، والشهادة المعتمدة.
                  </p>
                </div>
                
                <Markdown>
                  {previewLesson.summary || previewLesson.content.substring(0, 500) + '...'}
                </Markdown>
              </div>
              
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => {
                    setPreviewLesson(null);
                    handleEnroll();
                  }}
                  className="flex-grow py-4 rounded-2xl shadow-blue-500/20"
                >
                  سجل الآن للوصول الكامل
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setPreviewLesson(null)}
                  className="px-8 py-4 rounded-2xl"
                >
                  إغلاق
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
