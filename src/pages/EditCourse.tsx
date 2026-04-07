import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, addDoc, collection, getDocs, query, orderBy, deleteDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Course, Lesson } from '../types';
import { useAuth } from '../App';
import { 
  Save, 
  ArrowRight, 
  Image as ImageIcon, 
  Type, 
  Tag, 
  User, 
  DollarSign,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  BookOpen,
  Video,
  FileText,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendNotification } from '../components/NotificationManager';
import Button from '../components/Button';

export default function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(courseId ? true : false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'lessons'>('details');
  const [course, setCourse] = useState<Partial<Course>>({
    title: '',
    description: '',
    category: '',
    thumbnail: '',
    instructor: '',
    price: 0,
    isFree: false
  });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Partial<Lesson>>({
    title: '',
    content: '',
    videoUrl: '',
    videoType: 'standard',
    pdfUrl: '',
    order: 0
  });

  useEffect(() => {
    if (courseId) {
      const fetchData = async () => {
        try {
          const courseDoc = await getDoc(doc(db, 'courses', courseId));
          if (courseDoc.exists()) {
            setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
          }

          const lessonsSnapshot = await getDocs(query(collection(db, 'courses', courseId, 'lessons'), orderBy('order', 'asc')));
          setLessons(lessonsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lesson)));
        } catch (error) {
          console.error('Error fetching course data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [courseId]);

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (courseId) {
        await updateDoc(doc(db, 'courses', courseId), course);
      } else {
        const newCourse = await addDoc(collection(db, 'courses'), course);
        navigate(`/admin/courses/edit/${newCourse.id}`);
      }
      if (activeTab === 'details') navigate('/admin');
    } catch (error) {
      console.error('Error saving course:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLesson = async () => {
    if (!courseId) return;
    setSaving(true);
    try {
      if (currentLesson.id) {
        await updateDoc(doc(db, 'courses', courseId, 'lessons', currentLesson.id), currentLesson);
      } else {
        const lessonData = { ...currentLesson, courseId, order: lessons.length };
        await addDoc(collection(db, 'courses', courseId, 'lessons'), lessonData);
        
        // Notify enrolled students
        const progressSnapshot = await getDocs(query(collection(db, 'progress'), where('courseId', '==', courseId)));
        const studentIds = progressSnapshot.docs.map(d => d.data().userId);
        
        for (const studentId of studentIds) {
          await sendNotification(
            studentId, 
            'درس جديد متاح!', 
            `تمت إضافة درس "${currentLesson.title}" إلى كورس "${course.title}".`,
            'lesson'
          );
        }
      }
      
      const lessonsSnapshot = await getDocs(query(collection(db, 'courses', courseId, 'lessons'), orderBy('order', 'asc')));
      setLessons(lessonsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lesson)));
      setShowLessonModal(false);
      setCurrentLesson({ title: '', content: '', videoUrl: '', videoType: 'standard', pdfUrl: '', order: 0 });
    } catch (error) {
      console.error('Error saving lesson:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!courseId || !window.confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;
    try {
      await deleteDoc(doc(db, 'courses', courseId, 'lessons', id));
      setLessons(lessons.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  if (profile?.role !== 'admin') {
    return <div className="text-center py-20 text-red-600 font-bold">غير مصرح لك بالدخول لهذه الصفحة</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
            className="h-12 w-12 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 shadow-sm"
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-black text-slate-900">
            {courseId ? 'تعديل الكورس' : 'إضافة كورس جديد'}
          </h1>
        </div>
        <div className="flex gap-4">
          {courseId && (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <Button 
                variant={activeTab === 'details' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('details')}
                className={`px-6 py-2 h-auto ${activeTab === 'details' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                التفاصيل
              </Button>
              <Button 
                variant={activeTab === 'lessons' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('lessons')}
                className={`px-6 py-2 h-auto ${activeTab === 'lessons' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                الدروس ({lessons.length})
              </Button>
            </div>
          )}
          <Button 
            onClick={handleSaveCourse}
            isLoading={saving}
            className="px-8 py-4 shadow-blue-200"
          >
            {!saving && <Save className="h-5 w-5" />}
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'details' ? (
          <motion.form 
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSaveCourse} 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Basic Info */}
            <div className="md:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-lg mb-4">
                <BookOpen className="h-6 w-6" />
                المعلومات الأساسية
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">عنوان الكورس</label>
                  <div className="relative">
                    <Type className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      value={course.title}
                      onChange={(e) => setCourse({ ...course, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 pr-12 pl-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="مثال: أساسيات علم التشريح"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">وصف الكورس</label>
                  <textarea 
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[150px]"
                    placeholder="اكتب وصفاً تفصيلياً للكورس..."
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Media & Details */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-lg mb-4">
                <ImageIcon className="h-6 w-6" />
                الوسائط والتصنيف
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">رابط الصورة المصغرة</label>
                  <div className="relative">
                    <ImageIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      value={course.thumbnail}
                      onChange={(e) => setCourse({ ...course, thumbnail: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 pr-12 pl-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">التصنيف</label>
                  <div className="relative">
                    <Tag className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      value={course.category}
                      onChange={(e) => setCourse({ ...course, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 pr-12 pl-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="مثال: التشريح، الجراحة، الباطنة"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">اسم المحاضر</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      value={course.instructor}
                      onChange={(e) => setCourse({ ...course, instructor: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 pr-12 pl-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="د. هما علي"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-lg mb-4">
                <DollarSign className="h-6 w-6" />
                التسعير
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900">كورس مجاني</div>
                    <div className="text-xs text-slate-500">اجعل الكورس متاحاً للجميع</div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setCourse({ ...course, isFree: !course.isFree })}
                    className={`w-14 h-8 rounded-full transition-all relative ${course.isFree ? 'bg-teal-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${course.isFree ? 'right-7' : 'right-1'}`}></div>
                  </button>
                </div>

                {!course.isFree && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-bold text-slate-700 mb-2">السعر (ج.م)</label>
                    <div className="relative">
                      <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="number" 
                        value={course.price}
                        onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-100 pr-12 pl-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.form>
        ) : (
          <motion.div 
            key="lessons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">دروس الكورس</h2>
              <Button 
                onClick={() => {
                  setCurrentLesson({ title: '', content: '', videoUrl: '', videoType: 'standard', pdfUrl: '', order: lessons.length });
                  setShowLessonModal(true);
                }}
                className="px-6 py-3 shadow-blue-100"
              >
                <Plus className="h-5 w-5" />
                إضافة درس جديد
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{lesson.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        {lesson.videoUrl && <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1"><Video className="h-3 w-3" /> فيديو</span>}
                        {lesson.pdfUrl && <span className="text-[10px] text-teal-600 font-bold flex items-center gap-1"><FileText className="h-3 w-3" /> PDF</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCurrentLesson(lesson);
                        setShowLessonModal(true);
                      }}
                      className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <List className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lesson Modal */}
      <AnimatePresence>
        {showLessonModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900">{currentLesson.id ? 'تعديل الدرس' : 'إضافة درس جديد'}</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowLessonModal(false)}>
                  <XCircle className="h-6 w-6 text-slate-400" />
                </Button>
              </div>
              
              <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">عنوان الدرس</label>
                  <input 
                    type="text" 
                    value={currentLesson.title}
                    onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="مثال: مقدمة في التشريح"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">المحتوى النصي (Markdown)</label>
                  <textarea 
                    value={currentLesson.content}
                    onChange={(e) => setCurrentLesson({ ...currentLesson, content: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[200px]"
                    placeholder="اكتب محتوى الدرس هنا..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">رابط الفيديو</label>
                    <input 
                      type="text" 
                      value={currentLesson.videoUrl}
                      onChange={(e) => setCurrentLesson({ ...currentLesson, videoUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="YouTube, Vimeo, or direct link"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">رابط ملف PDF</label>
                    <input 
                      type="text" 
                      value={currentLesson.pdfUrl}
                      onChange={(e) => setCurrentLesson({ ...currentLesson, pdfUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="رابط تحميل المذكرة"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-8 bg-slate-50 flex justify-end gap-4">
                <Button 
                  variant="ghost"
                  onClick={() => setShowLessonModal(false)}
                  className="px-8 py-3 text-slate-500 hover:bg-slate-100"
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={handleSaveLesson}
                  isLoading={saving}
                  className="px-8 py-3 shadow-blue-100"
                >
                  حفظ الدرس
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
