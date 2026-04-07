import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Send, X, Bot, Sparkles, User, Loader2, Settings, Palette, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import Button from './Button';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type ThemeId = 'blue' | 'green' | 'purple' | 'dark' | 'amber';

interface ThemeConfig {
  id: ThemeId;
  name: string;
  header: string;
  bg: string;
  userMsg: string;
  botIcon: string;
  accent: string;
  text: string;
  inputBg: string;
}

const THEMES: Record<ThemeId, ThemeConfig> = {
  blue: {
    id: 'blue',
    name: 'أزرق (افتراضي)',
    header: 'bg-gradient-to-br from-blue-600 to-blue-800',
    bg: 'bg-slate-50/50',
    userMsg: 'bg-blue-600 text-white shadow-blue-100',
    botIcon: 'bg-slate-900 text-white',
    accent: 'text-blue-600',
    text: 'text-slate-700',
    inputBg: 'bg-slate-50'
  },
  green: {
    id: 'green',
    name: 'أخضر طبي',
    header: 'bg-gradient-to-br from-teal-600 to-emerald-800',
    bg: 'bg-emerald-50/30',
    userMsg: 'bg-teal-600 text-white shadow-teal-100',
    botIcon: 'bg-emerald-900 text-white',
    accent: 'text-teal-600',
    text: 'text-slate-700',
    inputBg: 'bg-emerald-50/50'
  },
  purple: {
    id: 'purple',
    name: 'بنفسجي أكاديمي',
    header: 'bg-gradient-to-br from-purple-600 to-indigo-800',
    bg: 'bg-indigo-50/30',
    userMsg: 'bg-purple-600 text-white shadow-purple-100',
    botIcon: 'bg-indigo-900 text-white',
    accent: 'text-purple-600',
    text: 'text-slate-700',
    inputBg: 'bg-indigo-50/50'
  },
  dark: {
    id: 'dark',
    name: 'الوضع الليلي',
    header: 'bg-slate-900 border-b border-slate-800',
    bg: 'bg-slate-950',
    userMsg: 'bg-blue-600 text-white shadow-blue-900/20',
    botIcon: 'bg-slate-800 text-blue-400',
    accent: 'text-blue-400',
    text: 'text-slate-300',
    inputBg: 'bg-slate-900'
  },
  amber: {
    id: 'amber',
    name: 'كهرماني دافئ',
    header: 'bg-gradient-to-br from-amber-600 to-orange-800',
    bg: 'bg-orange-50/30',
    userMsg: 'bg-amber-600 text-white shadow-amber-100',
    botIcon: 'bg-orange-900 text-white',
    accent: 'text-amber-600',
    text: 'text-slate-700',
    inputBg: 'bg-orange-50/50'
  }
};

export default function AITutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('blue');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'مرحباً بك! أنا مساعدك الطبي الذكي في HMA. كيف يمكنني مساعدتك في دراستك اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const theme = THEMES[currentTheme];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: "أنت مساعد تعليمي طبي ذكي في منصة HMA (أكاديمية هما الطبية). مهمتك هي مساعدة الطلاب في فهم المواضيع الطبية المعقدة، شرح المصطلحات، وتقديم نصائح دراسية. يجب أن تكون إجاباتك دقيقة علمياً، مشجعة، وباللغة العربية الفصحى البسيطة. إذا سُئلت عن تشخيص طبي حقيقي، ذكر الطالب دائماً بضرورة استشارة طبيب مختص وأن هذه المعلومات للأغراض التعليمية فقط.",
        },
      });

      const aiResponse = response.text || 'عذراً، واجهت مشكلة في معالجة طلبك. يرجى المحاولة مرة أخرى.';
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى التأكد من إعدادات المفتاح البرمجي.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <Button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 left-8 z-[60] h-14 w-14 rounded-full shadow-2xl shadow-blue-400/50 hover:scale-110 active:scale-95 transition-all group p-0 ${currentTheme === 'dark' ? 'bg-slate-800' : 'bg-blue-600'}`}
      >
        <div className="relative">
          <Bot className="h-7 w-7" />
          <div className={`absolute -top-1 -right-1 w-3 h-3 ${currentTheme === 'green' ? 'bg-emerald-400' : 'bg-teal-400'} rounded-full border-2 ${currentTheme === 'dark' ? 'border-slate-800' : 'border-blue-600'} animate-pulse`}></div>
        </div>
        <span className="absolute right-full mr-4 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          تحدث مع المساعد الذكي
        </span>
      </Button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 left-8 z-[60] w-[400px] max-w-[calc(100vw-64px)] h-[600px] max-h-[calc(100vh-120px)] ${currentTheme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'} rounded-[2.5rem] shadow-2xl border flex flex-col overflow-hidden`}
            dir="rtl"
          >
            {/* Header */}
            <div className={`${theme.header} p-6 flex justify-between items-center text-white relative z-10`}>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg leading-none">المساعد الذكي</h3>
                  <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest">HMA AI Tutor</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)} 
                  className={`h-9 w-9 rounded-xl transition-colors ${showSettings ? 'bg-white/20' : 'hover:bg-white/10'}`}
                  title="تخصيص المظهر"
                >
                  <Palette className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)} 
                  className="h-9 w-9 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow relative flex flex-col overflow-hidden">
              {/* Settings Overlay */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className={`absolute inset-0 z-20 ${currentTheme === 'dark' ? 'bg-slate-950' : 'bg-white'} p-6 flex flex-col`}
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h4 className={`font-black text-lg ${currentTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>تخصيص المظهر</h4>
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowSettings(false)} 
                        className="h-9 w-9 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        <X className="h-5 w-5 text-slate-400" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <p className={`text-xs font-bold uppercase tracking-widest ${currentTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>اختر السمة المفضلة:</p>
                      <div className="grid grid-cols-1 gap-3">
                        {(Object.values(THEMES) as ThemeConfig[]).map((t) => (
                          <Button
                            key={t.id}
                            variant="ghost"
                            onClick={() => {
                              setCurrentTheme(t.id);
                              setShowSettings(false);
                            }}
                            className={`flex items-center justify-between p-4 h-auto rounded-2xl border transition-all ${
                              currentTheme === t.id 
                                ? 'border-blue-500 bg-blue-50/10' 
                                : currentTheme === 'dark' ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-100 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-lg ${t.header}`}></div>
                              <span className={`font-bold text-sm ${currentTheme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{t.name}</span>
                            </div>
                            {currentTheme === t.id && <Check className="h-4 w-4 text-blue-500" />}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className={`mt-auto p-4 rounded-2xl ${currentTheme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} text-center`}>
                      <p className={`text-[10px] font-medium ${currentTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                        سيتم حفظ تفضيلاتك لهذا الجهاز
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className={`flex-grow overflow-y-auto p-6 space-y-6 ${theme.bg}`}>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : theme.botIcon}`}>
                      {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? `${theme.userMsg} rounded-tr-none` 
                        : `${currentTheme === 'dark' ? 'bg-slate-900 text-slate-200 border-slate-800' : 'bg-white text-slate-700 border-slate-100'} border rounded-tl-none shadow-sm`
                    }`}>
                      <div className={`prose prose-sm max-w-none ${currentTheme === 'dark' ? 'prose-invert' : ''}`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-xl ${theme.botIcon} flex items-center justify-center`}>
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className={`${currentTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} p-4 rounded-2xl rounded-tl-none border shadow-sm`}>
                      <Loader2 className={`h-4 w-4 animate-spin ${theme.accent}`} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className={`p-6 ${currentTheme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'} border-t`}>
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="اسأل أي سؤال طبي..."
                  className={`w-full ${theme.inputBg} border ${currentTheme === 'dark' ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-900'} pr-6 pl-14 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm`}
                />
                <Button 
                  onClick={handleSend}
                  isLoading={loading}
                  disabled={!input.trim()}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100`}
                >
                  {!loading && <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className={`text-[10px] ${currentTheme === 'dark' ? 'text-slate-600' : 'text-slate-400'} text-center mt-4`}>
                قد يخطئ الذكاء الاصطناعي أحياناً، يرجى مراجعة المصادر العلمية الموثقة.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
