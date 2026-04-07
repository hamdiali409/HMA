import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { ContentRequest } from '../types';
import { useAuth } from '../App';
import { 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Video, 
  BookOpen, 
  Stethoscope,
  ArrowRight,
  Send,
  User,
  Mail,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { sendNotification } from '../components/NotificationManager';
import Button from '../components/Button';

export default function AdminRequests() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const q = query(collection(db, 'contentRequests'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContentRequest));
        setRequests(list);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleUpdateStatus = async (requestId: string, userId: string, topic: string, newStatus: 'reviewed' | 'implemented') => {
    setUpdating(requestId);
    try {
      await updateDoc(doc(db, 'contentRequests', requestId), { status: newStatus });
      
      // Send notification to the user
      const title = newStatus === 'implemented' ? 'تم تنفيذ طلبك!' : 'تمت مراجعة طلبك';
      const body = newStatus === 'implemented' 
        ? `المحتوى الخاص بـ "${topic}" أصبح متاحاً الآن في المكتبة.`
        : `فريقنا الطبي قام بمراجعة طلبك بخصوص "${topic}". سنبدأ العمل عليه قريباً.`;
      
      await sendNotification(userId, title, body, 'reply');
      
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (profile?.role !== 'admin' && profile?.role !== 'instructor') {
    return <div className="text-center py-20 text-red-600 font-bold">غير مصرح لك بالدخول لهذه الصفحة</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
      <div className="flex items-center gap-4 mb-12">
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin')}
          className="h-12 w-12 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 shadow-sm"
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">طلبات المحتوى</h1>
          <p className="text-slate-500 font-medium">مراجعة وتنفيذ طلبات الطلاب للمحتوى الطبي الجديد.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <motion.div 
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${
                      request.type === 'video' ? 'bg-blue-50 text-blue-600' :
                      request.type === 'course' ? 'bg-purple-50 text-purple-600' :
                      request.type === 'case-study' ? 'bg-teal-50 text-teal-600' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                      {request.type === 'video' ? <Video className="h-6 w-6" /> :
                       request.type === 'course' ? <BookOpen className="h-6 w-6" /> :
                       request.type === 'case-study' ? <Stethoscope className="h-6 w-6" /> :
                       <MessageSquare className="h-6 w-6" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{request.topic}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {request.userEmail}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(request.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    {request.description || 'لا يوجد وصف إضافي'}
                  </p>
                </div>

                <div className="lg:w-64 flex flex-col justify-between gap-6">
                  <div className="flex items-center justify-end">
                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                      request.status === 'implemented' ? 'bg-teal-50 text-teal-600' :
                      request.status === 'reviewed' ? 'bg-blue-50 text-blue-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {request.status === 'implemented' ? <CheckCircle2 className="h-4 w-4" /> :
                       request.status === 'reviewed' ? <Send className="h-4 w-4" /> :
                       <Clock className="h-4 w-4" />}
                      {request.status === 'implemented' ? 'تم التنفيذ' :
                       request.status === 'reviewed' ? 'تمت المراجعة' :
                       'قيد الانتظار'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {request.status === 'pending' && (
                      <Button 
                        onClick={() => handleUpdateStatus(request.id, request.userId, request.topic, 'reviewed')}
                        isLoading={updating === request.id}
                        className="w-full py-3 shadow-blue-100"
                      >
                        تحديد كمتمت المراجعة
                      </Button>
                    )}
                    {request.status === 'reviewed' && (
                      <Button 
                        onClick={() => handleUpdateStatus(request.id, request.userId, request.topic, 'implemented')}
                        isLoading={updating === request.id}
                        className="w-full py-3 bg-teal-600 hover:bg-teal-700 shadow-teal-100"
                      >
                        تحديد كمتم التنفيذ
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
            <MessageSquare className="h-16 w-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">لا توجد طلبات حالياً</h3>
            <p className="text-slate-400">ستظهر طلبات الطلاب للمحتوى الجديد هنا.</p>
          </div>
        )}
      </div>
    </div>
  );
}
