import { createContext, useContext, useEffect, useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  useLocation
} from 'react-router-dom';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { UserProfile } from './types';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import LessonView from './pages/LessonView';
import QuizView from './pages/QuizView';
import Profile from './pages/Profile';
import CaseStudyView from './pages/CaseStudyView';
import CertificateView from './pages/CertificateView';
import RequestContentView from './pages/RequestContentView';
import ArticleDetail from './pages/ArticleDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminRequests from './pages/AdminRequests';
import EditCourse from './pages/EditCourse';
import Login from './pages/Login';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AITutor from './components/AITutor';
import SupportChat from './components/SupportChat';

// Auth Context
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  logout: async () => {} 
});

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
        // Skip logging for other errors, as this is simply a connection test.
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            // Create default profile
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'طالب جديد',
              role: 'student',
              createdAt: new Date().toISOString(),
              notificationsEnabled: false,
              dashboardSections: [
                { id: 'recently-viewed', title: 'شوهد مؤخراً', visible: true },
                { id: 'enrolled-courses', title: 'كورساتي الحالية', visible: true },
                { id: 'upcoming-quizzes', title: 'اختبارات قادمة', visible: true },
                { id: 'achievements', title: 'الإنجازات الأخيرة', visible: true },
                { id: 'need-help', title: 'تحتاج مساعدة؟', visible: true },
              ]
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, profile, loading, logout }}>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans" dir="rtl">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<CourseList />} />
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/courses/:courseId/lessons/:lessonId" element={user ? <LessonView /> : <Navigate to="/login" />} />
                <Route path="/courses/:courseId/quizzes/:quizId" element={user ? <QuizView /> : <Navigate to="/login" />} />
                <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                <Route path="/courses/:courseId/case-studies/:caseStudyId" element={user ? <CaseStudyView /> : <Navigate to="/login" />} />
                <Route path="/courses/:courseId/certificate" element={user ? <CertificateView /> : <Navigate to="/login" />} />
                <Route path="/request-content" element={user ? <RequestContentView /> : <Navigate to="/login" />} />
                <Route path="/articles/:articleId" element={<ArticleDetail />} />
                
                {/* Management Routes */}
                <Route path="/admin" element={(profile?.role === 'admin' || profile?.role === 'instructor') ? <AdminDashboard /> : <Navigate to="/" />} />
                <Route path="/admin/courses/new" element={(profile?.role === 'admin' || profile?.role === 'instructor') ? <EditCourse /> : <Navigate to="/" />} />
                <Route path="/admin/courses/edit/:courseId" element={(profile?.role === 'admin' || profile?.role === 'instructor') ? <EditCourse /> : <Navigate to="/" />} />
                <Route path="/admin/requests" element={(profile?.role === 'admin' || profile?.role === 'instructor') ? <AdminRequests /> : <Navigate to="/" />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              </Routes>
            </main>
            <AITutor />
            <SupportChat />
            <Footer />
          </div>
        </Router>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}
