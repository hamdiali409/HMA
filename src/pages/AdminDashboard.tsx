import { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Course, UserProfile } from '../types';
import { useAuth } from '../App';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'users' | 'stats'>('courses');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const coursesList = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(coursesList);

        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as UserProfile));
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكورس؟')) return;
    try {
      await deleteDoc(doc(db, 'courses', id));
      setCourses(courses.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'student' | 'instructor' | 'admin') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (profile?.role !== 'admin') {
    return <div className="text-center py-20 text-red-600 font-bold">غير مصرح لك بالدخول لهذه الصفحة</div>;
  }

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredUsers = users.filter(u => u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">لوحة الإدارة</h1>
          <p className="text-slate-500">إدارة المحتوى، المستخدمين، والتقارير الأكاديمية.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/admin/requests">
            <Button 
              variant="outline"
              className="bg-white text-slate-600 px-6 py-3 shadow-sm"
            >
              <MessageSquare className="h-5 w-5" />
              طلبات المحتوى
            </Button>
          </Link>
          <Link to="/admin/courses/new">
            <Button 
              className="px-6 py-3 shadow-blue-200"
            >
              <Plus className="h-5 w-5" />
              كورس جديد
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{courses.length}</div>
            <div className="text-sm text-slate-500 font-bold">كورس متاح</div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="bg-teal-50 p-4 rounded-2xl text-teal-600">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{users.length}</div>
            <div className="text-sm text-slate-500 font-bold">طالب مسجل</div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="bg-amber-50 p-4 rounded-2xl text-amber-600">
            <BarChart3 className="h-8 w-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">85%</div>
            <div className="text-sm text-slate-500 font-bold">معدل الإكمال</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center p-8 border-b border-slate-50 gap-6">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
            <Button 
              variant={activeTab === 'courses' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('courses')}
              className={`px-8 py-2.5 h-auto ${activeTab === 'courses' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              الكورسات
            </Button>
            <Button 
              variant={activeTab === 'users' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('users')}
              className={`px-8 py-2.5 h-auto ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              المستخدمين
            </Button>
            <Button 
              variant={activeTab === 'stats' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('stats')}
              className={`px-8 py-2.5 h-auto ${activeTab === 'stats' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              التقارير
            </Button>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="بحث..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 pr-12 pl-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'courses' && (
              <motion.div 
                key="courses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="overflow-x-auto"
              >
                <table className="w-full text-right">
                  <thead>
                    <tr className="text-slate-400 text-sm font-bold border-b border-slate-50">
                      <th className="pb-4 pr-4">الكورس</th>
                      <th className="pb-4">التصنيف</th>
                      <th className="pb-4">السعر</th>
                      <th className="pb-4">الحالة</th>
                      <th className="pb-4 text-left pl-4">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-6 pr-4">
                          <div className="flex items-center gap-4">
                            <img src={course.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                            <div>
                              <div className="font-bold text-slate-900">{course.title}</div>
                              <div className="text-xs text-slate-400">{course.instructor}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-6">
                          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">{course.category}</span>
                        </td>
                        <td className="py-6 font-bold text-slate-700">
                          {course.isFree ? 'مجاني' : `${course.price} ج.م`}
                        </td>
                        <td className="py-6">
                          <div className="flex items-center gap-1.5 text-teal-600 text-xs font-bold">
                            <CheckCircle className="h-4 w-4" />
                            منشور
                          </div>
                        </td>
                        <td className="py-6 text-left pl-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/admin/courses/edit/${course.id}`}>
                              <Button 
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Edit2 className="h-5 w-5" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCourse(course.id)}
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div 
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="overflow-x-auto"
              >
                <table className="w-full text-right">
                  <thead>
                    <tr className="text-slate-400 text-sm font-bold border-b border-slate-50">
                      <th className="pb-4 pr-4">المستخدم</th>
                      <th className="pb-4">البريد الإلكتروني</th>
                      <th className="pb-4">الدور</th>
                      <th className="pb-4">تاريخ التسجيل</th>
                      <th className="pb-4 text-left pl-4">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-6 pr-4">
                          <div className="font-bold text-slate-900">{user.displayName}</div>
                        </td>
                        <td className="py-6 text-slate-500 text-sm">{user.email}</td>
                        <td className="py-6">
                          <select 
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.uid, e.target.value as any)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer ${
                              user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 
                              user.role === 'instructor' ? 'bg-blue-50 text-blue-600' : 
                              'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <option value="student">طالب</option>
                            <option value="instructor">مدرب</option>
                            <option value="admin">مدير</option>
                          </select>
                        </td>
                        <td className="py-6 text-slate-400 text-xs">
                          {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="py-6 text-left pl-4">
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
