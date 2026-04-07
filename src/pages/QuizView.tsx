import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Quiz, Progress, Question } from '../types';
import { useAuth } from '../App';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  HelpCircle, 
  Trophy, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';

export default function QuizView() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !quizId || !user) return;

      try {
        // Fetch Quiz
        const quizDoc = await getDoc(doc(db, 'courses', courseId, 'quizzes', quizId));
        if (quizDoc.exists()) {
          setQuiz({ id: quizDoc.id, ...quizDoc.data() } as Quiz);
        } else {
          // Mock quiz for demo
          setQuiz({
            id: quizId,
            courseId,
            title: 'اختبار تقييمي للوحدة الأولى',
            questions: [
              {
                question: 'ما هو الوضع التشريحي القياسي للجسم؟',
                options: [
                  'الاستلقاء على الظهر',
                  'الوقوف بشكل مستقيم مع توجيه الراحتين للأمام',
                  'الجلوس مع وضع اليدين على الركبتين',
                  'الوقوف مع توجيه الراحتين للخلف'
                ],
                correctAnswer: 1,
                explanation: 'الوضع التشريحي القياسي يتطلب الوقوف المستقيم وتوجيه الراحتين للأمام.'
              },
              {
                question: 'أي من التالي يعتبر جزءاً من التشريح المجهري؟',
                options: [
                  'دراسة العظام الطويلة',
                  'دراسة عضلة القلب بالعين المجردة',
                  'دراسة الأنسجة والخلايا (Histology)',
                  'دراسة نمو الجنين'
                ],
                correctAnswer: 2,
                explanation: 'التشريح المجهري يركز على التراكيب التي لا ترى إلا بالمجهر مثل الخلايا والأنسجة.'
              },
              {
                question: 'ما هو المصطلح التشريحي الذي يعني "بعيد عن خط الوسط"؟',
                options: [
                  'Medial (إنسي)',
                  'Lateral (وحشي)',
                  'Superior (علوي)',
                  'Inferior (سفلي)'
                ],
                correctAnswer: 1,
                explanation: 'Lateral يعني وحشي أو بعيد عن خط منتصف الجسم.'
              }
            ]
          });
        }

        // Fetch Progress
        const progressId = `${user.uid}_${courseId}`;
        const progressDoc = await getDoc(doc(db, 'progress', progressId));
        if (progressDoc.exists()) {
          setProgress({ id: progressDoc.id, ...progressDoc.data() } as Progress);
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, quizId, user]);

  const handleOptionSelect = (idx: number) => {
    if (showResult) return;
    setSelectedOption(idx);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    // Check answer
    if (selectedOption === quiz?.questions[currentQuestionIdx].correctAnswer) {
      setScore(prev => prev + 1);
    }

    setShowResult(true);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIdx < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsFinished(true);
    if (!user || !courseId || !quizId || !progress) return;

    try {
      const finalScore = Math.round((score / (quiz?.questions.length || 1)) * 100);
      const progressRef = doc(db, 'progress', progress.id);
      await updateDoc(progressRef, {
        [`quizScores.${quizId}`]: finalScore,
        lastAccessed: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving quiz score:', error);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setIsFinished(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz) return <div className="text-center py-20">الاختبار غير موجود</div>;

  const currentQuestion = quiz.questions[currentQuestionIdx];

  if (isFinished) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100"
        >
          <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <Trophy className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">لقد أكملت الاختبار!</h1>
          <p className="text-slate-500 mb-8">نتيجتك النهائية هي:</p>
          
          <div className="text-6xl font-black text-blue-600 mb-10">
            {percentage}%
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary"
              onClick={restartQuiz}
              className="px-8 py-4 bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <RotateCcw className="h-5 w-5" />
              إعادة الاختبار
            </Button>
            {percentage >= 70 ? (
              <Link to={`/courses/${courseId}/certificate`}>
                <Button 
                  className="px-8 py-4 bg-teal-600 hover:bg-teal-700 shadow-teal-100"
                >
                  عرض الشهادة
                  <Award className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link to={`/courses/${courseId}`}>
                <Button 
                  className="px-8 py-4 shadow-blue-100"
                >
                  العودة للكورس
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <Link to={`/courses/${courseId}`} className="text-slate-500 hover:text-blue-600 flex items-center gap-2 transition-colors">
          <ArrowRight className="h-4 w-4" />
          إلغاء الاختبار
        </Link>
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          السؤال {currentQuestionIdx + 1} من {quiz.questions.length}
        </div>
      </div>

      <div className="bg-slate-200 h-2 rounded-full mb-12 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestionIdx + 1) / quiz.questions.length) * 100}%` }}
          className="bg-blue-600 h-full"
        ></motion.div>
      </div>

      <motion.div 
        key={currentQuestionIdx}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-10 leading-relaxed">
          {currentQuestion.question}
        </h2>

        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => {
            let statusClass = 'border-slate-100 hover:border-blue-200 hover:bg-blue-50/30';
            if (selectedOption === idx) statusClass = 'border-blue-600 bg-blue-50 ring-1 ring-blue-600';
            
            if (showResult) {
              if (idx === currentQuestion.correctAnswer) statusClass = 'border-teal-500 bg-teal-50 ring-1 ring-teal-500';
              else if (selectedOption === idx) statusClass = 'border-red-500 bg-red-50 ring-1 ring-red-500';
              else statusClass = 'border-slate-100 opacity-50';
            }

            return (
              <Button 
                key={idx}
                variant="outline"
                disabled={showResult}
                onClick={() => handleOptionSelect(idx)}
                className={`w-full text-right p-5 h-auto rounded-2xl border-2 transition-all flex items-center justify-between group ${statusClass}`}
              >
                <span className="font-medium text-slate-700">{option}</span>
                {showResult && idx === currentQuestion.correctAnswer && <CheckCircle className="h-5 w-5 text-teal-600" />}
                {showResult && selectedOption === idx && idx !== currentQuestion.correctAnswer && <XCircle className="h-5 w-5 text-red-600" />}
              </Button>
            );
          })}
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100"
            >
              <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
                <HelpCircle className="h-4 w-4" />
                التفسير العلمي:
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex justify-end">
          {!showResult ? (
            <Button 
              onClick={handleNext}
              disabled={selectedOption === null}
              className="px-10 py-4 shadow-blue-100"
            >
              تأكيد الإجابة
            </Button>
          ) : (
            <Button 
              variant="dark"
              onClick={goToNextQuestion}
              className="px-10 py-4"
            >
              {currentQuestionIdx < quiz.questions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة'}
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
