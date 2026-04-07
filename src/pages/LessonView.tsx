import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, query, collection, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Lesson, Progress, Course } from '../types';
import { useAuth } from '../App';
import Markdown from 'react-markdown';
import { Term, Quiz } from '../components/InteractiveLesson';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  PlayCircle, 
  FileText, 
  ArrowRight,
  List,
  Menu,
  X,
  ExternalLink,
  BookOpen,
  Sparkles,
  Download,
  Maximize,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';
import confetti from 'canvas-confetti';

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'summary' | 'references'>('content');
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playbackRate, setPlaybackRate] = useState(1);
  const lastSavedTimeRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const saveVideoProgress = async (currentTime: number, duration: number) => {
    if (!user || !courseId || !lessonId || !progress) return;

    try {
      const progressRef = doc(db, 'progress', progress.id);
      const isCompleted = currentTime / duration > 0.9; // Mark as completed if 90% viewed
      
      const newLessonProgress = {
        ...(progress.lessonProgress || {}),
        [lessonId]: {
          currentTime,
          duration,
          isCompleted: isCompleted || (progress.lessonProgress?.[lessonId]?.isCompleted ?? false),
          lastUpdated: new Date().toISOString()
        }
      };

      const updateData: any = {
        lessonProgress: newLessonProgress,
        lastAccessed: new Date().toISOString()
      };

      // If marked as completed via video, also add to completedLessons array
      if (isCompleted && !progress.completedLessons.includes(lessonId)) {
        updateData.completedLessons = arrayUnion(lessonId);
      }

      await updateDoc(progressRef, updateData);
      
      // Update local state
      setProgress({
        ...progress,
        lessonProgress: newLessonProgress,
        completedLessons: isCompleted && !progress.completedLessons.includes(lessonId) 
          ? [...progress.completedLessons, lessonId] 
          : progress.completedLessons
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `progress/${progress.id}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !lessonId || !user) return;

      try {
        // Fetch Course
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
        }

        // Fetch Current Lesson
        const lessonDoc = await getDoc(doc(db, 'courses', courseId, 'lessons', lessonId));
        if (lessonDoc.exists()) {
          setLesson({ id: lessonDoc.id, ...lessonDoc.data() } as Lesson);
        } else {
          // Mock lesson for demo
          setLesson({
            id: lessonId,
            courseId,
            title: 'مقدمة في علم التشريح',
            content: `
# مقدمة في علم التشريح (Introduction to Anatomy)

علم التشريح هو العلم الذي يدرس بنية الكائنات الحية وأجزائها. يعتبر حجر الزاوية في التعليم الطبي.

## المحاور الرئيسية:
1. **[التشريح العياني](#term:دراسة_التراكيب_التي_يمكن_رؤيتها_بالعين_المجردة_دون_الحاجة_لمجهر):** دراسة التراكيب التي يمكن رؤيتها بالعين المجردة.
2. **[التشريح المجهري](#term:دراسة_الأنسجة_والخلايا_باستخدام_المجهر_الضوئي_أو_الإلكتروني):** دراسة الأنسجة والخلايا.
3. **التشريح التطوري (Developmental Anatomy):** دراسة التغيرات من الإخصاب حتى البلوغ.

### الأوضاع التشريحية (Anatomical Position):
يجب وصف الجسم دائماً وهو في الوضع التشريحي القياسي:
- الوقوف بشكل مستقيم.
- الوجه للأمام.
- الذراعان بجانب الجسم مع توجيه الراحتين للأمام.
- القدمان متوازيتان.

\`\`\`quiz
{
  "question": "ما هو الوضع التشريحي القياسي لليدين؟",
  "options": [
    "الراحتان موجهتان للخلف",
    "الراحتان موجهتان للأمام",
    "اليدان في الجيوب",
    "اليدان فوق الرأس"
  ],
  "answer": 1,
  "explanation": "في الوضع التشريحي القياسي، يجب أن تكون راحة اليد (Palm) موجهة للأمام (Anteriorly) لضمان توحيد الوصف الطبي."
}
\`\`\`

> "التشريح هو مصير الطب." - مقولة طبية قديمة.
            `,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
            order: 1
          });
        }

        // Fetch All Lessons for Sidebar
        const lessonsSnapshot = await getDocs(collection(db, 'courses', courseId, 'lessons'));
        const lessonsData = lessonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
        if (lessonsData.length === 0) {
          setAllLessons([
            { id: 'l1', courseId, title: 'مقدمة في علم التشريح', content: '', order: 1 },
            { id: 'l2', courseId, title: 'الجهاز العظمي - الجزء الأول', content: '', order: 2 },
            { id: 'l3', courseId, title: 'الجهاز العضلي وتصنيف العضلات', content: '', order: 3 },
          ]);
        } else {
          setAllLessons(lessonsData.sort((a, b) => a.order - b.order));
        }

        // Fetch Progress
        const progressId = `${user.uid}_${courseId}`;
        const progressDoc = await getDoc(doc(db, 'progress', progressId));
        if (progressDoc.exists()) {
          setProgress({ id: progressDoc.id, ...progressDoc.data() } as Progress);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `courses/${courseId}/lessons/${lessonId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId, user]);

  useEffect(() => {
    // Smooth scroll to top when lesson changes
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [lessonId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = allLessons.findIndex(l => l.id === lessonId);
      if (e.key === 'ArrowLeft') {
        // Next lesson in RTL
        if (currentIndex < allLessons.length - 1) {
          navigate(`/courses/${courseId}/lessons/${allLessons[currentIndex + 1].id}`);
        }
      } else if (e.key === 'ArrowRight') {
        // Previous lesson in RTL
        if (currentIndex > 0) {
          navigate(`/courses/${courseId}/lessons/${allLessons[currentIndex - 1].id}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allLessons, lessonId, courseId, navigate]);

  const handleComplete = async () => {
    if (!user || !courseId || !lessonId || !progress) return;

    try {
      const progressRef = doc(db, 'progress', progress.id);
      const newLessonProgress = {
        ...(progress.lessonProgress || {}),
        [lessonId]: {
          currentTime: progress.lessonProgress?.[lessonId]?.currentTime || 0,
          duration: progress.lessonProgress?.[lessonId]?.duration || 0,
          isCompleted: true,
          lastUpdated: new Date().toISOString()
        }
      };

      await updateDoc(progressRef, {
        completedLessons: arrayUnion(lessonId),
        lessonProgress: newLessonProgress,
        lastAccessed: new Date().toISOString()
      });
      
      // Update local state
      setProgress({
        ...progress,
        completedLessons: [...progress.completedLessons, lessonId],
        lessonProgress: newLessonProgress
      });

      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#0d9488', '#fbbf24']
      });

      // Show success message
      setShowSuccess(true);

      // Delay navigation to show reinforcement
      setTimeout(() => {
        setShowSuccess(false);
        const currentIndex = allLessons.findIndex(l => l.id === lessonId);
        if (currentIndex < allLessons.length - 1) {
          navigate(`/courses/${courseId}/lessons/${allLessons[currentIndex + 1].id}`);
        }
      }, 2500);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `progress/${progress.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lesson) return <div className="text-center py-20">الدرس غير موجود</div>;

  const isCompleted = progress?.completedLessons.includes(lessonId!);
  const filteredLessons = allLessons.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Success Reinforcement Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-blue-500/10 border border-blue-100 text-center max-w-sm mx-4"
            >
              <div className="w-24 h-24 bg-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="h-12 w-12 text-teal-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">أحسنت!</h2>
              <p className="text-slate-600 font-bold mb-8">لقد أكملت هذا الدرس بنجاح. استمر في هذا التقدم الرائع!</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5, ease: "linear" }}
                  className="bg-blue-600 h-full"
                />
              </div>
              <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest">جاري الانتقال للدرس التالي...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed bottom-6 left-6 z-50">
        <Button 
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-full h-14 w-14 shadow-xl"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <List className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className={`fixed lg:relative inset-y-0 right-0 w-80 bg-slate-50 border-l border-slate-200 z-40 lg:z-0 overflow-y-auto ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}
          >
            <div className="p-6 border-b border-slate-200 bg-white sticky top-0 z-10">
              <Link to={`/courses/${courseId}`} className="flex items-center gap-2 text-slate-500 text-sm mb-4 hover:text-blue-600 transition-colors">
                <ArrowRight className="h-4 w-4" />
                العودة للكورس
              </Link>
              <h2 className="font-bold text-slate-900 line-clamp-1">{course?.title}</h2>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">تقدم الكورس</span>
                  <span className="text-[10px] font-black text-blue-600">{Math.round(((progress?.completedLessons.length || 0) / allLessons.length) * 100)}%</span>
                </div>
                <div className="bg-blue-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-500" 
                    style={{ width: `${(progress?.completedLessons.length || 0) / allLessons.length * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-6 relative">
                <input 
                  type="text"
                  placeholder="بحث في الدروس..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl py-2.5 pr-10 pl-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <List className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="p-4 space-y-1">
              {filteredLessons.length > 0 ? (
                filteredLessons.map((l, idx) => (
                  <Link 
                    key={l.id}
                    to={`/courses/${courseId}/lessons/${l.id}`}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl transition-all group ${
                      l.id === lessonId 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                      : 'bg-transparent text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                      l.id === lessonId ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'
                    }`}>
                      {progress?.completedLessons.includes(l.id) ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                    </div>
                    <span className="text-sm font-bold line-clamp-1">{l.title}</span>
                  </Link>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-400 text-sm">لا توجد نتائج للبحث</p>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main ref={mainContentRef} className="flex-grow overflow-y-auto scroll-smooth">
        <AnimatePresence mode="wait">
          <motion.div
            key={lessonId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-8"
          >
            {/* Video Player or AI Placeholder */}
          {lesson.videoUrl ? (
            <div className="relative aspect-video bg-slate-900 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl mb-8 md:mb-12 border-2 md:border-4 border-slate-100">
              {lesson.videoType === 'ai-generated' && (
                <div className="absolute top-4 right-4 z-10 bg-blue-600/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  فيديو مولد بالذكاء الاصطناعي
                </div>
              )}
              {lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be') || lesson.videoUrl.includes('vimeo.com') ? (
                <iframe 
                  src={lesson.videoUrl} 
                  className="w-full h-full"
                  allowFullScreen
                  title={lesson.title}
                ></iframe>
              ) : (
                <div className="relative group/video">
                  <video 
                    ref={videoRef}
                    src={lesson.videoUrl}
                    controls
                    className="w-full h-full"
                    onTimeUpdate={(e) => {
                      const video = e.currentTarget;
                      const currentTime = Math.floor(video.currentTime);
                      if (currentTime !== lastSavedTimeRef.current && currentTime % 5 === 0) {
                        lastSavedTimeRef.current = currentTime;
                        saveVideoProgress(video.currentTime, video.duration);
                      }
                    }}
                    onLoadedMetadata={(e) => {
                      const video = e.currentTarget;
                      const savedProgress = progress?.lessonProgress?.[lessonId!];
                      if (savedProgress && !savedProgress.isCompleted) {
                        video.currentTime = savedProgress.currentTime;
                      }
                    }}
                    onEnded={(e) => {
                      saveVideoProgress(e.currentTarget.duration, e.currentTarget.duration);
                    }}
                  />
                  
                  {/* Custom Overlay Controls for native video */}
                  <div className="absolute bottom-16 left-4 right-4 flex items-center justify-between opacity-0 group-hover/video:opacity-100 transition-opacity pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl">
                      <div className="flex items-center gap-1 px-2 border-l border-white/10">
                        <Settings className="h-3 w-3 text-blue-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">السرعة</span>
                      </div>
                      {[0.5, 1, 1.25, 1.5, 2].map(rate => (
                        <Button
                          key={rate}
                          variant={playbackRate === rate ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.playbackRate = rate;
                              setPlaybackRate(rate);
                            }
                          }}
                          className={`px-2.5 py-1 text-[10px] h-auto ${
                            playbackRate === rate 
                            ? 'bg-blue-600 text-white' 
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {rate}x
                        </Button>
                      ))}
                    </div>

                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={toggleFullScreen}
                      className="pointer-events-auto bg-slate-900/80 backdrop-blur-md h-10 w-10 rounded-2xl border border-white/10 text-white hover:bg-blue-600 shadow-2xl"
                      title="ملء الشاشة"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : lesson.videoType === 'ai-generated' ? (
            <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl mb-10 border-4 border-slate-100 flex flex-col items-center justify-center text-white p-8 text-center">
              <div className="bg-blue-600/20 p-6 rounded-full mb-6 animate-pulse">
                <Sparkles className="h-12 w-12 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">جاري إنشاء الفيديو بالذكاء الاصطناعي</h3>
              <p className="text-slate-400 max-w-md">نحن نستخدم تقنيات متقدمة لإنشاء شرح مرئي لهذا الدرس. سيكون الفيديو متاحاً قريباً.</p>
            </div>
          ) : null}

          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 -mx-4 sm:-mx-6 lg:-mx-12 px-4 sm:px-6 lg:px-12 py-3 md:py-4 mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 shadow-sm">
            <div className="flex flex-col gap-0.5 md:gap-1">
              <h1 className="text-lg md:text-2xl font-black text-slate-900 line-clamp-1">{lesson.title}</h1>
              <div className="flex flex-wrap gap-2 items-center">
                {lesson.videoType === 'ai-generated' && (
                  <div className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider w-fit border border-blue-100">
                    <Sparkles className="h-2.5 w-2.5" />
                    ذكاء اصطناعي
                  </div>
                )}
                {lesson.pdfUrl && (
                  <Button 
                    as="a"
                    href={lesson.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    variant="ghost"
                    className="inline-flex items-center gap-1.5 text-teal-600 hover:bg-teal-50 px-2 py-0.5 rounded-full text-[9px] h-auto border border-transparent hover:border-teal-100"
                  >
                    <Download className="h-2.5 w-2.5" />
                    PDF
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              {lesson.pdfUrl && (
                <Button 
                  as="a"
                  href={lesson.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  variant="outline"
                  size="sm"
                  className="hidden md:flex px-4 py-2 shadow-sm text-sm"
                >
                  <Download className="h-4 w-4" />
                  تحميل PDF
                </Button>
              )}
              <Button 
                onClick={handleComplete}
                disabled={isCompleted}
                variant={isCompleted ? 'outline' : 'primary'}
                size="sm"
                className={`flex-grow md:flex-grow-0 px-6 py-2.5 text-sm ${
                  isCompleted 
                  ? 'bg-teal-50 text-teal-600 border-teal-100' 
                  : 'shadow-blue-100'
                }`}
              >
                {isCompleted ? <CheckCircle className="h-4 w-4" /> : null}
                {isCompleted ? 'تم الإكمال' : 'تحديد كمكتمل'}
              </Button>
            </div>
          </div>

          {/* Tabs Navigation (Desktop) / Accordion (Mobile) */}
          <div className="mb-8">
            {/* Desktop Tabs */}
            <div className="hidden md:flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
                  activeTab === 'content' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText className="h-4 w-4" />
                المحتوى
              </button>
              {lesson.summary && (
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
                    activeTab === 'summary' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  الملخص
                </button>
              )}
              {lesson.references && lesson.references.length > 0 && (
                <button
                  onClick={() => setActiveTab('references')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
                    activeTab === 'references' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  المراجع
                </button>
              )}
            </div>

            {/* Mobile Accordion-style Tabs */}
            <div className="md:hidden flex flex-col gap-2">
              <button
                onClick={() => setActiveTab(activeTab === 'content' ? 'content' : 'content')}
                className={`flex items-center justify-between p-4 rounded-2xl font-black text-sm transition-all ${
                  activeTab === 'content' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4" />
                  المحتوى
                </div>
                {activeTab === 'content' && <CheckCircle className="h-4 w-4" />}
              </button>
              
              {lesson.summary && (
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`flex items-center justify-between p-4 rounded-2xl font-black text-sm transition-all ${
                    activeTab === 'summary' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4" />
                    الملخص
                  </div>
                  {activeTab === 'summary' && <CheckCircle className="h-4 w-4" />}
                </button>
              )}

              {lesson.references && lesson.references.length > 0 && (
                <button
                  onClick={() => setActiveTab('references')}
                  className={`flex items-center justify-between p-4 rounded-2xl font-black text-sm transition-all ${
                    activeTab === 'references' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4" />
                    المراجع
                  </div>
                  {activeTab === 'references' && <CheckCircle className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'content' && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-900 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg"
              >
                <Markdown
                  components={{
                    a: ({node, ...props}) => {
                      if (props.href?.startsWith('#term:')) {
                        const definition = decodeURIComponent(props.href.replace('#term:', '').replace(/_/g, ' '));
                        return <Term term={props.children as string} definition={definition} />;
                      }
                      return <a {...props} />;
                    },
                    code: (props: any) => {
                      const {node, inline, className, children, ...rest} = props;
                      const match = /language-(\w+)/.exec(className || '');
                      if (!inline && match && match[1] === 'quiz') {
                        try {
                          const quizData = JSON.parse(String(children).replace(/\n$/, ''));
                          return <Quiz {...quizData} />;
                        } catch (e) {
                          return <pre className={className}>{children}</pre>;
                        }
                      }
                      return <code {...rest} className={className}>{children}</code>;
                    }
                  }}
                >
                  {lesson.content}
                </Markdown>
              </motion.div>
            )}

            {activeTab === 'summary' && lesson.summary && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 md:p-10 bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl md:rounded-[2.5rem] border border-blue-100 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 p-2 rounded-xl">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl font-black text-slate-900">ملخص الذكاء الاصطناعي</h2>
                    </div>
                  </div>
                  <div className="text-slate-700 leading-relaxed text-lg prose prose-slate max-w-none">
                    <Markdown>{lesson.summary}</Markdown>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'references' && lesson.references && lesson.references.length > 0 && (
              <motion.div
                key="references"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 md:p-10 bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-slate-100 p-2 rounded-xl">
                    <BookOpen className="h-5 w-5 text-slate-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">المصادر والمراجع العلمية</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lesson.references.map((ref, idx) => (
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
                <p className="mt-6 text-xs text-slate-400 text-center italic">
                  تمت مراجعة هذا المحتوى للتأكد من دقته العلمية بناءً على المصادر المذكورة أعلاه.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-16 pt-12 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
            {allLessons.findIndex(l => l.id === lessonId) > 0 ? (
              <Link 
                to={`/courses/${courseId}/lessons/${allLessons[allLessons.findIndex(l => l.id === lessonId) - 1].id}`}
                className="w-full sm:w-auto"
              >
                <Button 
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 h-auto rounded-2xl bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 shadow-sm group"
                >
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">الدرس السابق</div>
                    <div className="text-sm line-clamp-1">{allLessons[allLessons.findIndex(l => l.id === lessonId) - 1].title}</div>
                  </div>
                </Button>
              </Link>
            ) : <div className="hidden sm:block"></div>}

            {allLessons.findIndex(l => l.id === lessonId) < allLessons.length - 1 ? (
              <Link 
                to={`/courses/${courseId}/lessons/${allLessons[allLessons.findIndex(l => l.id === lessonId) + 1].id}`}
                className="w-full sm:w-auto"
              >
                <Button 
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 h-auto rounded-2xl shadow-blue-100 group"
                >
                  <div className="text-left">
                    <div className="text-[10px] text-blue-200 uppercase tracking-widest mb-0.5">الدرس التالي</div>
                    <div className="text-sm line-clamp-1">{allLessons[allLessons.findIndex(l => l.id === lessonId) + 1].title}</div>
                  </div>
                  <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : <div className="hidden sm:block"></div>}
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  </div>
  </>
);
}
