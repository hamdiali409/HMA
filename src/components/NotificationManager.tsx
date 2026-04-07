import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { messaging, db, auth } from '../firebase';
import { useAuth } from '../App';
import { Bell, BellOff, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification, UserProfile } from '../types';
import Button from './Button';

// IMPORTANT: Replace this with your actual VAPID key from Firebase Console
// Settings -> Cloud Messaging -> Web configuration -> Web Push certificates
const VAPID_KEY = "YOUR_VAPID_KEY_HERE";

export default function NotificationManager() {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);

  useEffect(() => {
    if (!user) return;

    // Listen for real-time notifications in Firestore
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user]);

  const requestPermission = async () => {
    try {
      const status = await Notification.requestPermission();
      setPermission(status);
      
      if (status === 'granted') {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (token && user) {
          await updateDoc(doc(db, 'users', user.uid), {
            fcmToken: token,
            notificationsEnabled: true
          });
          console.log('FCM Token registered:', token);
        }
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  };

  useEffect(() => {
    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      // In a real app, you might show a toast here
      if (payload.notification) {
        // We also store them in Firestore for persistence
      }
    });

    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button 
        variant="ghost"
        size="icon"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative h-10 w-10 rounded-xl hover:bg-slate-100 transition-colors"
      >
        {permission === 'granted' ? (
          <Bell className={`h-6 w-6 ${unreadCount > 0 ? 'text-blue-600' : 'text-slate-600'}`} />
        ) : (
          <BellOff className="h-6 w-6 text-slate-400" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            ></div>
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-black text-slate-900">التنبيهات</h3>
                {permission !== 'granted' && (
                  <Button 
                    variant="ghost"
                    onClick={requestPermission}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline p-0 h-auto hover:bg-transparent"
                  >
                    تفعيل التنبيهات
                  </Button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.read ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 mb-1">{notif.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">{notif.body}</p>
                          <span className="text-[10px] text-slate-400 mt-2 block">
                            {new Date(notif.createdAt).toLocaleTimeString('ar-EG')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Info className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">لا توجد تنبيهات حالياً</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 text-center">
                <Button 
                  variant="ghost"
                  className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors p-0 h-auto hover:bg-transparent"
                >
                  عرض الكل
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Utility function to "send" a notification (simulating server-side action)
export const sendNotification = async (userId: string, title: string, body: string, type: 'lesson' | 'reply' | 'system', link?: string) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      body,
      type,
      link,
      read: false,
      createdAt: new Date().toISOString()
    });
    
    // In a real server environment, you would also call FCM API here
    // using the user's fcmToken stored in Firestore.
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
