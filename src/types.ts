export interface DashboardSection {
  id: string;
  title: string;
  visible: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt: string;
  dashboardSections?: DashboardSection[];
  fcmToken?: string;
  notificationsEnabled?: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'lesson' | 'reply' | 'system';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  instructor: string;
  price: number;
  isFree: boolean;
  rating?: number;
  ratingCount?: number;
}

export interface Reference {
  source: 'PubMed' | 'WHO' | 'Other';
  title: string;
  url: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl?: string;
  videoType?: 'ai-generated' | 'standard';
  pdfUrl?: string;
  summary?: string;
  references?: Reference[];
  order: number;
  isPreviewable?: boolean;
}

export interface CaseStudy {
  id: string;
  courseId: string;
  title: string;
  patientHistory: string;
  physicalExamination: string;
  investigations: string;
  diagnosis: string;
  management: string;
  references?: Reference[];
  order: number;
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  questions: Question[];
  type?: 'mcq' | 'case-based';
}

export interface LessonProgress {
  currentTime: number;
  duration: number;
  isCompleted: boolean;
  lastUpdated: string;
}

export interface Progress {
  id: string;
  userId: string;
  courseId: string;
  completedLessons: string[];
  lessonProgress?: Record<string, LessonProgress>;
  quizScores: Record<string, number>;
  lastAccessed: string;
}

export interface ContentRequest {
  id: string;
  userId: string;
  userEmail: string;
  topic: string;
  description: string;
  type: 'video' | 'course' | 'case-study' | 'other';
  status: 'pending' | 'reviewed' | 'implemented';
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  thumbnail: string;
  author: string;
  createdAt: string;
  readTime: string;
}

export interface SupportChat {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  status: 'active' | 'closed';
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

export interface SupportMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  text: string;
  role: 'user' | 'support' | 'ai';
  createdAt: string;
}
