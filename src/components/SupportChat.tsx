import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  setDoc,
  getDocs,
  limit
} from 'firebase/firestore';
import { SupportChat as SupportChatType, SupportMessage } from '../types';
import { MessageCircle, X, Send, Loader2, Bot, User, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { useTranslation } from 'react-i18next';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function SupportChat() {
  const { user, profile } = useAuth();
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAr = i18n.language === 'ar';

  useEffect(() => {
    if (!user || !isOpen) return;

    // Find or create active support chat for user
    const findChat = async () => {
      try {
        const q = query(
          collection(db, 'supportChats'),
          where('userId', '==', user.uid),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setChatId(snapshot.docs[0].id);
        } else {
          // Create new chat
          const newChatRef = await addDoc(collection(db, 'supportChats'), {
            userId: user.uid,
            userEmail: user.email,
            userName: profile?.displayName || user.displayName || 'User',
            status: 'active',
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString()
          });
          setChatId(newChatRef.id);
          
          // Add welcome message
          await addDoc(collection(db, 'supportChats', newChatRef.id, 'messages'), {
            chatId: newChatRef.id,
            senderId: 'system',
            senderName: 'HMA Support',
            text: isAr 
              ? 'مرحباً بك في أكاديمية HMA الطبية! كيف يمكنني مساعدتك اليوم؟ أنا مساعدك الذكي وجاهز للإجابة على استفساراتك.' 
              : 'Welcome to HMA Medical Academy! How can I help you today? I am your AI assistant ready to answer your questions.',
            role: 'ai',
            createdAt: new Date().toISOString()
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'supportChats');
      }
    };

    findChat();
  }, [user, isOpen, isAr, profile]);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'supportChats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportMessage));
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `supportChats/${chatId}/messages`);
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chatId || !user) return;

    const text = inputText.trim();
    setInputText('');
    
    try {
      // Add user message
      await addDoc(collection(db, 'supportChats', chatId, 'messages'), {
        chatId,
        senderId: user.uid,
        senderName: profile?.displayName || user.displayName || 'User',
        text,
        role: 'user',
        createdAt: new Date().toISOString()
      });

      // Update chat last message
      await updateDoc(doc(db, 'supportChats', chatId), {
        lastMessage: text,
        lastMessageAt: new Date().toISOString()
      });

      // AI Response
      setIsTyping(true);
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: "user", parts: [{ text: `You are the AI support assistant for HMA Medical Academy (أكاديمية HMA الطبية). 
          The platform provides medical courses, case studies, and quizzes for medical students and professionals.
          Answer the user's question in the same language they used (Arabic or English).
          Be professional, helpful, and encouraging.
          If the question is medical, provide a helpful answer but always include a disclaimer that this is for educational purposes only.
          
          User question: ${text}` }] }
        ],
      });

      const response = await model;
      const aiText = response.text || (isAr ? "عذراً، لم أستطع معالجة طلبك." : "Sorry, I couldn't process your request.");

      await addDoc(collection(db, 'supportChats', chatId, 'messages'), {
        chatId,
        senderId: 'ai',
        senderName: 'HMA AI',
        text: aiText,
        role: 'ai',
        createdAt: new Date().toISOString()
      });

      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-end" dir={isAr ? 'rtl' : 'ltr'}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Headphones className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{isAr ? 'الدعم الفني المباشر' : 'Live Support'}</h3>
                  <p className="text-xs text-blue-100">{isAr ? 'متصل الآن' : 'Online Now'}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-1 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 items-center bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-xs text-slate-500">{isAr ? 'الذكاء الاصطناعي يكتب...' : 'AI is typing...'}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Type your message...'}
                  className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!isOpen && <span className="hidden sm:inline font-medium pr-2">{isAr ? 'تحدث معنا' : 'Chat with us'}</span>}
      </motion.button>
    </div>
  );
}
