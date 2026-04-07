import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Article } from '../types';
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  ArrowRight,
  Tag
} from 'lucide-react';
import { motion } from 'motion/react';
import Button from './Button';

interface ArticleCardProps {
  article: Article;
  showRelated?: boolean;
}

export default function ArticleCard({ article, showRelated = false }: ArticleCardProps) {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (showRelated) {
      const fetchRelated = async () => {
        setLoadingRelated(true);
        try {
          // Fetch articles in same category, excluding current one
          const q = query(
            collection(db, 'articles'),
            where('category', '==', article.category),
            limit(4)
          );
          
          const querySnapshot = await getDocs(q);
          const related = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Article))
            .filter(a => a.id !== article.id)
            .slice(0, 3);
          
          setRelatedArticles(related);
        } catch (error) {
          console.error('Error fetching related articles:', error);
        } finally {
          setLoadingRelated(false);
        }
      };

      fetchRelated();
    }
  }, [article.id, article.category, showRelated]);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full group hover:shadow-xl transition-all duration-500">
      {/* Thumbnail */}
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <img 
          src={article.thumbnail} 
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-slate-400 text-xs font-bold mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(article.createdAt).toLocaleDateString('ar-EG')}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {article.readTime}
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>

        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
          {article.content.substring(0, 150)}...
        </p>

        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-xs font-black text-slate-700">{article.author}</span>
          </div>
          <Link to={`/articles/${article.id}`}>
            <Button 
              variant="ghost" 
              className="text-blue-600 font-black text-sm hover:gap-3 transition-all p-0 h-auto hover:bg-transparent"
            >
              اقرأ المزيد
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Related Articles Section */}
      {showRelated && (
        <div className="bg-slate-50/50 border-t border-slate-100 p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <Tag className="h-4 w-4 text-blue-600" />
            </div>
            <h4 className="text-lg font-black text-slate-900">مقالات ذات صلة</h4>
          </div>

          {loadingRelated ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-600"></div>
            </div>
          ) : relatedArticles.length > 0 ? (
            <div className="space-y-4">
              {relatedArticles.map((rel) => (
                <div 
                  key={rel.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 group/rel hover:border-blue-200 transition-all"
                >
                  <img 
                    src={rel.thumbnail} 
                    alt={rel.title}
                    loading="lazy"
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-grow min-w-0">
                    <h5 className="text-sm font-black text-slate-900 line-clamp-1 mb-1 group-hover/rel:text-blue-600 transition-colors">
                      {rel.title}
                    </h5>
                    <Link to={`/articles/${rel.id}`}>
                      <Button 
                        variant="ghost" 
                        className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-wider p-0 h-auto hover:bg-transparent"
                      >
                        اقرأ المزيد
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-xs text-center py-4 font-medium italic">
              لا توجد مقالات مشابهة حالياً
            </p>
          )}
        </div>
      )}
    </div>
  );
}
