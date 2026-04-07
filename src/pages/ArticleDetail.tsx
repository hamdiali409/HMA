import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Article } from '../types';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowRight,
  Share2,
  Bookmark,
  ChevronRight,
  Tag,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import Button from '../components/Button';

export default function ArticleDetail() {
  const { articleId } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;
      setLoading(true);
      try {
        const articleDoc = await getDoc(doc(db, 'articles', articleId));
        if (articleDoc.exists()) {
          const data = { id: articleDoc.id, ...articleDoc.data() } as Article;
          setArticle(data);
          
          // Fetch related articles
          const q = query(
            collection(db, 'articles'),
            where('category', '==', data.category),
            limit(4)
          );
          const relatedSnapshot = await getDocs(q);
          const related = relatedSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Article))
            .filter(a => a.id !== data.id)
            .slice(0, 3);
          setRelatedArticles(related);
        } else {
          // Mock data for demo
          const mockArticle: Article = {
            id: articleId,
            title: 'مستقبل الذكاء الاصطناعي في التشخيص الطبي',
            content: `
# الذكاء الاصطناعي والطب

يشهد القطاع الطبي تحولاً جذرياً بفضل تقنيات الذكاء الاصطناعي. لم يعد الأمر مجرد خيال علمي، بل أصبح واقعاً ملموساً يساعد الأطباء في اتخاذ قرارات أكثر دقة وسرعة.

## كيف يساعد الذكاء الاصطناعي؟

1. **تحليل الصور الطبية**: يمكن للخوارزميات اكتشاف الأورام في الأشعة السينية والرنين المغناطيسي بدقة تفوق البشر في بعض الأحيان.
2. **التنبؤ بالأمراض**: من خلال تحليل البيانات الضخمة للمرضى، يمكن التنبؤ باحتمالية الإصابة بأمراض مزمنة قبل ظهور أعراضها.
3. **تخصيص العلاج**: يساعد في اختيار الدواء الأنسب لكل مريض بناءً على ملفه الجيني.

## التحديات

رغم الفوائد الكبيرة، تظل هناك تحديات تتعلق بخصوصية البيانات وأخلاقيات المهنة، بالإضافة إلى ضرورة وجود إشراف بشري دائم.
            `,
            category: 'تكنولوجيا طبية',
            tags: ['AI', 'HealthTech', 'Diagnosis'],
            thumbnail: 'https://picsum.photos/seed/medical-ai/1200/600',
            author: 'د. أحمد علي',
            createdAt: new Date().toISOString(),
            readTime: '5 دقائق'
          };
          setArticle(mockArticle);
          
          // Mock related articles
          setRelatedArticles([
            {
              id: 'rel-1',
              title: 'تطبيقات الواقع المعزز في الجراحة',
              content: '...',
              category: 'تكنولوجيا طبية',
              tags: ['AR', 'Surgery'],
              thumbnail: 'https://picsum.photos/seed/surgery-ar/400/300',
              author: 'د. سارة محمود',
              createdAt: new Date().toISOString(),
              readTime: '4 دقائق'
            },
            {
              id: 'rel-2',
              title: 'الروبوتات الطبية: ثورة في الرعاية الصحية',
              content: '...',
              category: 'تكنولوجيا طبية',
              tags: ['Robotics', 'Health'],
              thumbnail: 'https://picsum.photos/seed/robotics/400/300',
              author: 'د. خالد يوسف',
              createdAt: new Date().toISOString(),
              readTime: '6 دقائق'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo(0, 0);
  }, [articleId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!article) return <div className="text-center py-20">المقال غير موجود</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-100 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/">
            <Button 
              variant="ghost" 
              className="text-blue-600 mb-8 hover:gap-3 transition-all font-black text-sm p-0 h-auto hover:bg-transparent"
            >
              <ArrowRight className="h-4 w-4" />
              العودة للرئيسية
            </Button>
          </Link>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="bg-blue-50 text-blue-600 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest border border-blue-100">
              {article.category}
            </span>
            <div className="flex items-center gap-4 text-slate-400 text-sm font-bold">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(article.createdAt).toLocaleDateString('ar-EG')}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {article.readTime}
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
            {article.title}
          </h1>

          <div className="flex items-center justify-between py-8 border-y border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">الكاتب</span>
                <span className="text-lg font-black text-slate-900">{article.author}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100"
              >
                <Bookmark className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative rounded-[3rem] overflow-hidden mb-12 shadow-2xl border-8 border-white">
          <img 
            src={article.thumbnail} 
            alt={article.title}
            className="w-full h-auto object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="bg-white p-8 md:p-16 rounded-[3rem] border border-slate-100 shadow-sm mb-12">
          <div className="prose prose-lg prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-blue-600 prose-li:text-slate-600">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, idx) => (
                <span key={idx} className="bg-slate-50 text-slate-500 text-xs font-black px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Related Articles Section */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">مقالات ذات صلة</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedArticles.map((rel, idx) => (
              <motion.div
                key={rel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={rel.thumbnail} 
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 block">{rel.category}</span>
                  <h3 className="text-lg font-black text-slate-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {rel.title}
                  </h3>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                      <Clock className="h-3 w-3" />
                      {rel.readTime}
                    </div>
                    <Link to={`/articles/${rel.id}`}>
                      <Button 
                        variant="ghost" 
                        className="text-blue-600 font-black text-xs hover:gap-2 transition-all p-0 h-auto hover:bg-transparent"
                      >
                        اقرأ المزيد
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
