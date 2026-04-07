import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, CheckCircle2, XCircle, HelpCircle, ChevronLeft } from 'lucide-react';
import Button from './Button';

interface TermProps {
  term: string;
  definition: string;
}

export const Term: React.FC<TermProps> = ({ term, definition }) => {
  const [show, setShow] = useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShow(false);
    }, 300);
  };

  return (
    <span 
      className="relative inline-block group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setShow(!show)}
        className="text-blue-600 font-bold border-b-2 border-dotted border-blue-400 hover:text-blue-800 hover:border-blue-600 transition-all cursor-help"
      >
        {term}
      </button>
      
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl z-50 text-sm leading-relaxed pointer-events-none"
          >
            <div className="flex items-start gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span className="font-black text-blue-400 uppercase tracking-widest text-[10px]">تعريف المصطلحات</span>
            </div>
            <p className="font-medium">{definition}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

interface QuizProps {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export const Quiz: React.FC<QuizProps> = ({ question, options, answer, explanation }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleCheck = () => {
    if (selected !== null) {
      setShowResult(true);
    }
  };

  const isCorrect = selected === answer;

  return (
    <div className="my-10 p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden relative group/quiz">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl group-hover/quiz:bg-blue-600/10 transition-colors" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-xl">
            <HelpCircle className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">اختبر معلوماتك</span>
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-8 leading-tight">{question}</h3>

        <div className="space-y-3">
          {options.map((option, idx) => (
            <button
              key={idx}
              disabled={showResult}
              onClick={() => setSelected(idx)}
              className={`w-full text-right p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                showResult
                  ? idx === answer
                    ? 'border-teal-500 bg-teal-50 text-teal-900'
                    : idx === selected
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : 'border-slate-100 bg-slate-50 opacity-50'
                  : selected === idx
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="font-bold">{option}</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                showResult
                  ? idx === answer
                    ? 'bg-teal-500 border-teal-500 text-white'
                    : idx === selected
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-slate-200'
                  : selected === idx
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-200 group-hover:border-blue-400'
              }`}>
                {showResult && idx === answer && <CheckCircle2 className="h-4 w-4" />}
                {showResult && idx === selected && idx !== answer && <XCircle className="h-4 w-4" />}
                {!showResult && selected === idx && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          {!showResult ? (
            <Button
              onClick={handleCheck}
              disabled={selected === null}
              className="px-8 py-4 rounded-2xl shadow-blue-100"
            >
              تحقق من الإجابة
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <div className="flex items-center gap-2 text-teal-600 font-black">
                  <CheckCircle2 className="h-6 w-6" />
                  <span>إجابة صحيحة! أحسنت</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 font-black">
                  <XCircle className="h-6 w-6" />
                  <span>إجابة غير صحيحة، حاول مرة أخرى</span>
                </div>
              )}
            </div>
          )}
          
          {showResult && (
            <Button
              variant="ghost"
              onClick={() => {
                setSelected(null);
                setShowResult(false);
              }}
              className="text-slate-400 hover:text-blue-600"
            >
              إعادة المحاولة
            </Button>
          )}
        </div>

        <AnimatePresence>
          {showResult && explanation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">توضيح علمي</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{explanation}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
