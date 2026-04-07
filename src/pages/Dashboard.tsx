import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Progress, Course, UserProfile, Quiz, AppNotification } from '../types';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import InstructorDashboard from '../components/InstructorDashboard';
import Button from '../components/Button';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  CheckCircle, 
  PlayCircle, 
  Star, 
  LayoutDashboard,
  GraduationCap,
  ChevronLeft,
  Calendar,
  HelpCircle,
  History,
  Settings,
  Eye,
  EyeOff,
  GripVertical,
  X,
  Bell,
  Info
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { setDoc } from 'firebase/firestore';
import { DashboardSection } from '../types';

interface EnrolledCourse extends Course {
  progress: Progress;
  quizzes: Quiz[];
  lessonCount: number;
}

function NotificationHistory({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Bell className="h-5 w-5 text-blue-600" />
        آخر التنبيهات
      </h3>
      <div className="space-y-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl"></div>)}
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <div key={notif.id} className={`p-4 rounded-2xl border transition-all ${notif.read ? 'bg-white border-slate-50' : 'bg-blue-50/30 border-blue-100'}`}>
              <h4 className="text-sm font-bold text-slate-900 mb-1">{notif.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{notif.body}</p>
              <span className="text-[10px] text-slate-400 mt-2 block">
                {new Date(notif.createdAt).toLocaleDateString('ar-EG')}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Info className="h-8 w-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">لا توجد تنبيهات جديدة</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [sections, setSections] = useState<DashboardSection[]>([
    { id: 'recently-viewed', title: 'شوهد مؤخراً', visible: true },
    { id: 'enrolled-courses', title: 'كورساتي الحالية', visible: true },
    { id: 'upcoming-quizzes', title: 'اختبارات قادمة', visible: true },
    { id: 'achievements', title: 'الإنجازات الأخيرة', visible: true },
    { id: 'need-help', title: 'تحتاج مساعدة؟', visible: true },
  ]);

  useEffect(() => {
    if (profile?.dashboardSections) {
      setSections(profile.dashboardSections);
    }
  }, [profile]);

  const saveSettings = async (newSections: DashboardSection[]) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...profile,
        dashboardSections: newSections
      });
    } catch (error) {
      console.error('Error saving dashboard settings:', error);
    }
  };

  const toggleVisibility = (id: string) => {
    const newSections = sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
    setSections(newSections);
    saveSettings(newSections);
  };

  const handleReorder = (newOrder: DashboardSection[]) => {
    setSections(newOrder);
    saveSettings(newOrder);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch Progress
        const progressQuery = query(collection(db, 'progress'), where('userId', '==', user.uid));
        const progressSnapshot = await getDocs(progressQuery);
        const progressList = progressSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Progress));

        // Fetch Course Details, Quizzes, and Lessons for each progress
        const coursesWithProgress: EnrolledCourse[] = [];
        
        for (const p of progressList) {
          const courseDoc = await getDoc(doc(db, 'courses', p.courseId));
          const quizzesSnapshot = await getDocs(collection(db, 'courses', p.courseId, 'quizzes'));
          const quizzes = quizzesSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Quiz));
          
          const lessonsSnapshot = await getDocs(collection(db, 'courses', p.courseId, 'lessons'));
          const lessonCount = lessonsSnapshot.size || 5; // Default to 5 for demo if empty

          if (courseDoc.exists()) {
            coursesWithProgress.push({
              ...(courseDoc.data() as Course),
              id: courseDoc.id,
              progress: p,
              quizzes: quizzes,
              lessonCount: lessonCount
            });
          } else {
            // Mock course for demo if not found in DB
            coursesWithProgress.push({
              id: p.courseId,
              title: 'أساسيات علم التشريح البشري',
              description: 'كورس شامل يغطي جميع أجهزة الجسم البشري.',
              category: 'التشريح',
              thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=600',
              instructor: 'د. أحمد علي',
              price: 299,
              isFree: false,
              progress: p,
              quizzes: quizzes.length > 0 ? quizzes : [{ id: 'q1', courseId: p.courseId, title: 'اختبار الوحدة الأولى', questions: [{}, {}, {}] } as any],
              lessonCount: 12
            });
          }
        }

        setEnrolledCourses(coursesWithProgress);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (profile?.role === 'instructor') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <InstructorDashboard profile={profile} />
      </div>
    );
  }

  const totalCompletedLessons = enrolledCourses.reduce((acc, curr) => acc + curr.progress.completedLessons.length, 0);
  const averageScore = enrolledCourses.length > 0 
    ? Math.round(enrolledCourses.reduce((acc, curr) => {
        const scores = Object.values(curr.progress.quizScores);
        return acc + (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
      }, 0) / enrolledCourses.length)
    : 0;

  // Recently Viewed: Sorted by lastAccessed
  const recentlyViewed = [...enrolledCourses].sort((a, b) => 
    new Date(b.progress.lastAccessed).getTime() - new Date(a.progress.lastAccessed).getTime()
  ).slice(0, 3);

  // Upcoming Quizzes: Quizzes in enrolled courses that haven't been taken yet
  const upcomingQuizzes = enrolledCourses.flatMap(course => 
    course.quizzes.filter(quiz => !course.progress.quizScores[quiz.id])
      .map(quiz => ({ ...quiz, courseTitle: course.title }))
  ).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome Header */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-12 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute top-4 left-4">
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setIsCustomizing(true)}
            title="تخصيص لوحة التحكم"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">أهلاً بك، {profile?.displayName} 👋</h1>
          <p className="text-slate-500">سعيدون برؤيتك مرة أخرى. استمر في رحلتك التعليمية اليوم!</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-blue-50 p-6 rounded-2xl text-center min-w-[120px]">
            <div className="text-2xl font-bold text-blue-600 mb-1">{totalCompletedLessons}</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">درس مكتمل</div>
          </div>
          <div className="bg-teal-50 p-6 rounded-2xl text-center min-w-[120px]">
            <div className="text-2xl font-bold text-teal-600 mb-1">{averageScore}%</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">متوسط الدرجات</div>
          </div>
          <div className="bg-amber-50 p-6 rounded-2xl text-center min-w-[120px]">
            <div className="text-2xl font-bold text-amber-600 mb-1">{enrolledCourses.length}</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">كورس مسجل</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {sections.filter(s => s.visible && ['recently-viewed', 'enrolled-courses'].includes(s.id)).map((section) => {
            if (section.id === 'recently-viewed' && recentlyViewed.length > 0) {
              return (
                <section key={section.id}>
                  <div className="flex items-center gap-2 mb-6">
                    <History className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {recentlyViewed.map((course) => (
                      <Link 
                        key={course.id} 
                        to={`/courses/${course.id}`}
                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-4 items-center"
                      >
                        <img src={course.thumbnail} alt={course.title} className="w-20 h-20 object-cover rounded-xl" referrerPolicy="no-referrer" />
                        <div className="text-right">
                          <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{course.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">{course.instructor}</p>
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-600 font-bold">
                            <Clock className="h-3 w-3" />
                            منذ {new Date(course.progress.lastAccessed).toLocaleDateString('ar-SA')}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            }
            if (section.id === 'enrolled-courses') {
              return (
                <section key={section.id}>
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                      <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
                    </div>
                    <Link to="/courses" className="text-blue-600 text-sm font-bold hover:underline">استكشاف المزيد</Link>
                  </div>

                  {enrolledCourses.length > 0 ? (
                    <div className="space-y-6">
                      {enrolledCourses.map((course) => {
                        const completedCount = course.progress.completedLessons.length;
                        const totalCount = course.lessonCount;
                        const progressPercent = Math.round((completedCount / totalCount) * 100);
                        
                        return (
                          <motion.div 
                            key={course.id}
                            whileHover={{ scale: 1.01 }}
                            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center"
                          >
                            <div className="relative w-full md:w-40 h-28 flex-shrink-0">
                              <img 
                                src={course.thumbnail} 
                                alt={course.title} 
                                className="w-full h-full object-cover rounded-2xl"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <PlayCircle className="text-white h-10 w-10" />
                              </div>
                            </div>
                            
                            <div className="flex-grow text-right w-full">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-900">{course.title}</h3>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  آخر دخول: {new Date(course.progress.lastAccessed).toLocaleDateString('ar-SA')}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 mb-4">
                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{course.instructor}</span>
                                <span className="text-xs text-blue-600 font-bold">{course.category}</span>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                  <div className="text-xs font-bold text-slate-600">
                                    إتمام الكورس: <span className="text-blue-600">{progressPercent}%</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {completedCount} من {totalCount} دروس مكتملة
                                  </div>
                                </div>
                                <div className="flex-grow bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full transition-all duration-500 ${
                                      progressPercent === 100 ? 'bg-teal-500' : 'bg-blue-600'
                                    }`}
                                  ></motion.div>
                                </div>
                              </div>
                            </div>
                            
                            <Link to={`/courses/${course.id}`}>
                              <Button size="icon" className="shadow-blue-100 flex-shrink-0">
                                <ChevronLeft className="h-6 w-6" />
                              </Button>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
                      <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="h-10 w-10 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">لم تسجل في أي كورس بعد</h3>
                      <p className="text-slate-500 mb-8">ابدأ رحلتك التعليمية الآن باختيار كورس من مكتبتنا.</p>
                      <Link to="/courses">
                        <Button className="px-8 py-3 shadow-blue-100">
                          تصفح الكورسات
                        </Button>
                      </Link>
                    </div>
                  )}
                </section>
              );
            }
            return null;
          })}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          {user && <NotificationHistory userId={user.uid} />}
          {sections.filter(s => s.visible && ['upcoming-quizzes', 'achievements', 'need-help'].includes(s.id)).map((section) => {
            if (section.id === 'upcoming-quizzes') {
              return (
                <div key={section.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    {section.title}
                  </h3>
                  <div className="space-y-4">
                    {upcomingQuizzes.length > 0 ? upcomingQuizzes.map((quiz, idx) => (
                      <Link 
                        key={idx} 
                        to={`/courses/${quiz.courseId}/quizzes/${quiz.id}`}
                        className="block p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all"
                      >
                        <h4 className="text-sm font-bold text-slate-900 mb-1">{quiz.title}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{quiz.courseTitle}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-md font-bold">جاهز للبدء</span>
                          <ChevronLeft className="h-3 w-3 text-slate-400" />
                        </div>
                      </Link>
                    )) : (
                      <p className="text-sm text-slate-400 text-center py-4">لا توجد اختبارات معلقة</p>
                    )}
                  </div>
                </div>
              );
            }
            if (section.id === 'achievements') {
              return (
                <div key={section.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    {section.title}
                  </h3>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="bg-teal-50 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">أكملت درس "مقدمة في التشريح"</h4>
                        <p className="text-xs text-slate-400 mt-1">منذ ساعتين</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Star className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">حصلت على 100% في اختبار الوحدة</h4>
                        <p className="text-xs text-slate-400 mt-1">منذ يوم واحد</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            if (section.id === 'need-help') {
              return (
                <div key={section.id} className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl text-white">
                  <GraduationCap className="h-10 w-10 text-blue-500 mb-6" />
                  <h3 className="text-xl font-bold mb-4">{section.title}</h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    فريق الدعم الفني والأكاديمي متاح دائماً للإجابة على استفساراتك الطبية والتقنية.
                  </p>
                  <Button variant="secondary" className="w-full py-3 bg-white text-slate-900 hover:bg-slate-100">
                    تحدث مع الدعم
                  </Button>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Customization Modal */}
      <AnimatePresence>
        {isCustomizing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900">تخصيص لوحة التحكم</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsCustomizing(false)}>
                  <X className="h-6 w-6 text-slate-400" />
                </Button>
              </div>
              
              <div className="p-8">
                <p className="text-slate-500 text-sm mb-6 text-right">اسحب لترتيب الأقسام، أو اضغط على العين لإخفائها.</p>
                
                <Reorder.Group axis="y" values={sections} onReorder={handleReorder} className="space-y-3">
                  {sections.map((section) => (
                    <Reorder.Item 
                      key={section.id} 
                      value={section}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        section.visible ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-slate-300 cursor-grab active:cursor-grabbing" />
                        <span className={`font-bold ${section.visible ? 'text-slate-900' : 'text-slate-400'}`}>
                          {section.title}
                        </span>
                      </div>
                      
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleVisibility(section.id)}
                        className={`h-9 w-9 rounded-lg transition-colors p-0 ${
                          section.visible ? 'text-blue-600 bg-blue-50' : 'text-slate-400 bg-slate-100'
                        }`}
                      >
                        {section.visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                      </Button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
              
              <div className="p-8 bg-slate-50 flex justify-end">
                <Button 
                  onClick={() => setIsCustomizing(false)}
                  className="px-8 py-3 shadow-blue-100"
                >
                  حفظ وإغلاق
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
