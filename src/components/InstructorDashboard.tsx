import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Course, ContentRequest, UserProfile } from '../types';
import { Link } from 'react-router-dom';
import Button from './Button';
import { 
  Users, 
  BookOpen, 
  PlusCircle, 
  MessageSquare, 
  TrendingUp, 
  ChevronLeft,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface InstructorDashboardProps {
  profile: UserProfile;
}

export default function InstructorDashboard({ profile }: InstructorDashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Instructor's Courses
        const coursesQuery = query(collection(db, 'courses'), where('instructor', '==', profile.displayName), limit(5));
        const coursesSnapshot = await getDocs(coursesQuery);
        setCourses(coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));

        // Fetch Recent Content Requests
        const requestsQuery = query(collection(db, 'requests'), limit(5));
        const requestsSnapshot = await getDocs(requestsQuery);
        setRequests(requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContentRequest)));
      } catch (error) {
        console.error('Error fetching instructor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    { label: "إجمالي الطلاب", value: "1,240", icon: <Users className="h-6 w-6 text-blue-600" />, bg: "bg-blue-50" },
    { label: "كورساتك", value: courses.length.toString(), icon: <BookOpen className="h-6 w-6 text-teal-600" />, bg: "bg-teal-50" },
    { label: "طلبات المحتوى", value: requests.length.toString(), icon: <MessageSquare className="h-6 w-6 text-purple-600" />, bg: "bg-purple-50" },
    { label: "معدل الإكمال", value: "85%", icon: <TrendingUp className="h-6 w-6 text-amber-600" />, bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 blur-[120px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-right">
            <h1 className="text-4xl font-black mb-4 tracking-tight">أهلاً بك يا دكتور، {profile.displayName} 👨‍🏫</h1>
            <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
              لوحة تحكم المدربين: هنا يمكنك إدارة كورساتك، متابعة طلابك، والرد على طلبات المحتوى الجديدة.
            </p>
          </div>
          <div className="flex gap-4">
            <Link to="/admin/courses/new">
              <Button 
                className="px-8 py-4 shadow-blue-900/20"
              >
                <PlusCircle className="h-6 w-6" />
                إنشاء كورس جديد
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={`${stat.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
              {stat.icon}
            </div>
            <div className="text-4xl font-black text-slate-900 mb-2">{stat.value}</div>
            <div className="text-sm text-slate-500 font-black uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Managed Courses */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-blue-600" />
              كورساتك الحالية
            </h2>
            <Link to="/admin" className="text-blue-600 font-black hover:underline">إدارة الكل</Link>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {courses.length > 0 ? courses.map((course) => (
              <div key={course.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center group hover:shadow-xl transition-all duration-500">
                <img src={course.thumbnail} alt={course.title} className="w-full md:w-48 h-32 object-cover rounded-3xl shadow-lg" referrerPolicy="no-referrer" />
                <div className="flex-grow text-right">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black text-slate-900">{course.title}</h3>
                    <span className="bg-teal-50 text-teal-600 px-4 py-1 rounded-full text-xs font-black">نشط</span>
                  </div>
                  <div className="flex items-center gap-6 text-slate-500 text-sm font-bold mb-6">
                    <span className="flex items-center gap-2"><Users className="h-4 w-4" /> 450 طالب</span>
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 12 ساعة</span>
                  </div>
                  <div className="flex gap-3">
                    <Link to={`/admin/courses/edit/${course.id}`}>
                      <Button variant="secondary" className="px-6 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm">
                        تعديل
                      </Button>
                    </Link>
                    <Link to={`/courses/${course.id}`}>
                      <Button variant="outline" className="px-6 py-2.5 bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 text-sm">
                        عرض
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="bg-white p-20 rounded-[3rem] border border-dashed border-slate-200 text-center">
                <PlusCircle className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-900 mb-4">لم تقم بإنشاء أي كورس بعد</h3>
                <p className="text-slate-500 mb-10 text-lg">ابدأ بمشاركة خبرتك الطبية مع آلاف الطلاب اليوم.</p>
                <Link to="/admin/courses/new">
                  <Button className="px-10 py-4 shadow-blue-100">
                    إنشاء أول كورس
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Content Requests Sidebar */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <MessageSquare className="h-7 w-7 text-purple-600" />
            طلبات الطلاب
          </h2>
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    req.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600'
                  }`}>
                    {req.status === 'pending' ? 'قيد الانتظار' : 'تمت المراجعة'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{new Date(req.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>
                <h4 className="font-black text-slate-900 mb-2">{req.topic}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{req.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-[10px] text-blue-600 font-black">{req.userEmail}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Link to="/admin" className="block text-center py-4 text-slate-400 font-black hover:text-blue-600 transition-colors text-sm">عرض جميع الطلبات</Link>
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200">
            <AlertCircle className="h-10 w-10 mb-6 text-blue-200" />
            <h3 className="text-xl font-black mb-4">نصيحة للمدرب الذكي</h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-6 font-medium">
              استخدم الذكاء الاصطناعي في توليد مسودات الدروس لتوفير الوقت، ثم قم بمراجعتها طبياً لضمان الدقة.
            </p>
            <div className="flex items-center gap-2 text-xs font-black text-blue-200">
              <CheckCircle className="h-4 w-4" />
              دقة طبية 100%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
