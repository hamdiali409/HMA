import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Course } from '../types';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen, Clock, Users, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import Button from '../components/Button';
import Rating from '../components/Rating';

export default function CourseList() {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t('common.all'));

  const categories = [
    t('common.all'),
    i18n.language === 'ar' ? 'التشريح' : 'Anatomy',
    i18n.language === 'ar' ? 'علم وظائف الأعضاء' : 'Physiology',
    i18n.language === 'ar' ? 'الكيمياء الحيوية' : 'Biochemistry',
    i18n.language === 'ar' ? 'علم الأمراض' : 'Pathology',
    i18n.language === 'ar' ? 'الجراحة' : 'Surgery',
    i18n.language === 'ar' ? 'الباطنة' : 'Internal Medicine'
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        
        // If no courses in DB, use mock data for demo
        if (coursesData.length === 0) {
          const mockCourses: Course[] = [
            {
              id: '1',
              title: 'أساسيات علم التشريح البشري (AI Enhanced)',
              description: 'كورس شامل يغطي جميع أجهزة الجسم البشري مع شرح مفصل للعظام والعضلات والأعصاب، مدعوم بفيديوهات ثنائية الأبعاد مولدة بالذكاء الاصطناعي.',
              category: 'التشريح',
              thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=600',
              instructor: 'د. هما علي',
              price: 299,
              isFree: false,
              rating: 4.9,
              ratingCount: 128
            },
            {
              id: '2',
              title: 'مقدمة في علم وظائف الأعضاء (Physiology)',
              description: 'تعرف على كيفية عمل أجهزة الجسم المختلفة والتوازن الحيوي داخل الإنسان. كورس مجاني بالكامل للمبتدئين.',
              category: 'علم وظائف الأعضاء',
              thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=600',
              instructor: 'د. سارة محمد',
              price: 0,
              isFree: true,
              rating: 4.7,
              ratingCount: 85
            },
            {
              id: '3',
              title: 'الكيمياء الحيوية السريرية المتقدمة',
              description: 'دراسة العمليات الكيميائية داخل الكائنات الحية وتطبيقاتها في التشخيص الطبي مع محاكاة AI للتفاعلات.',
              category: 'الكيمياء الحيوية',
              thumbnail: 'https://images.unsplash.com/photo-1532187875605-1ef6c237ddc4?auto=format&fit=crop&q=80&w=600',
              instructor: 'د. خالد إبراهيم',
              price: 150,
              isFree: false,
              rating: 4.8,
              ratingCount: 64
            },
            {
              id: '4',
              title: 'علم الأمراض العام (Pathology AI)',
              description: 'فهم ميكانيكية حدوث الأمراض والتغيرات النسيجية المصاحبة لها باستخدام تقنيات التعرف على الصور بالذكاء الاصطناعي.',
              category: 'علم الأمراض',
              thumbnail: 'https://images.unsplash.com/photo-1579154235602-481a2aef0c65?auto=format&fit=crop&q=80&w=600',
              instructor: 'د. ليلى حسن',
              price: 250,
              isFree: false,
              rating: 4.6,
              ratingCount: 42
            },
            {
              id: '5',
              title: 'أساسيات الإسعافات الأولية (مجاني)',
              description: 'تعلم مهارات إنقاذ الحياة الأساسية في حالات الطوارئ. كورس تفاعلي مجاني مقدم من HMA.',
              category: 'الجراحة',
              thumbnail: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=600',
              instructor: 'د. محمد سامي',
              price: 0,
              isFree: true,
              rating: 4.9,
              ratingCount: 210
            },
            {
              id: '6',
              title: 'تفسير تخطيط القلب (ECG Masterclass)',
              description: 'أتقن قراءة وتفسير رسم القلب الكهربائي من خلال حالات سريرية واقعية وشروحات AI مبسطة.',
              category: 'الباطنة',
              thumbnail: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?auto=format&fit=crop&q=80&w=600',
              instructor: 'د. هاني يوسف',
              price: 0,
              isFree: true,
              rating: 4.8,
              ratingCount: 156
            },
            {
              id: '7',
              title: 'علم الصيدلة السريري (Pharmacology)',
              description: 'دراسة شاملة للأدوية، تفاعلاتها، وآثارها الجانبية مع التركيز على التطبيقات السريرية الحديثة.',
              category: 'الباطنة',
              thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=600',
              instructor: 'د. منى أحمد',
              price: 200,
              isFree: false,
              rating: 4.7,
              ratingCount: 92
            },
            {
              id: '8',
              title: 'الجراحة العامة للمبتدئين',
              description: 'مبادئ الجراحة، التعقيم، والتعامل مع الجروح والعمليات الصغرى بأسلوب علمي مبسط.',
              category: 'الجراحة',
              thumbnail: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=600',
              instructor: 'د. ياسر كمال',
              price: 350,
              isFree: false,
              rating: 4.5,
              ratingCount: 38
            },
            {
              id: '9',
              title: 'علم الأنسجة (Histology AI)',
              description: 'استكشاف الأنسجة البشرية تحت المجهر مع شروحات مدعومة بالذكاء الاصطناعي لتسهيل الحفظ والفهم.',
              category: 'التشريح',
              thumbnail: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600',
              instructor: 'د. نادية حسن',
              price: 120,
              isFree: false,
              rating: 4.6,
              ratingCount: 55
            },
            {
              id: '10',
              title: 'طب الأطفال الوقائي',
              description: 'دليل شامل لصحة الطفل، التطعيمات، والنمو السليم من الولادة وحتى المراهقة.',
              category: 'الباطنة',
              thumbnail: 'https://images.unsplash.com/photo-1581594632702-f20137f0c562?auto=format&fit=crop&q=80&w=600',
              instructor: 'د. عمر خالد',
              price: 0,
              isFree: true,
              rating: 4.8,
              ratingCount: 78
            }
          ];
          setCourses(mockCourses);
        } else {
          setCourses(coursesData);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === t('common.all') || course.category === selectedCategory || (i18n.language === 'en' && course.category === 'التشريح' && selectedCategory === 'Anatomy'); // Simple mapping for demo
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
        <div className={i18n.language === 'ar' ? 'text-right' : 'text-left'}>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            {i18n.language === 'ar' ? (
              <>مكتبة كورسات <span className="text-blue-600">HMA</span> الذكية</>
            ) : (
              <><span className="text-blue-600">HMA</span> Smart Course Library</>
            )}
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">{t('courses.subtitle')}</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative">
            <Search className={`absolute ${i18n.language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400`} />
            <input 
              type="text" 
              placeholder={t('courses.searchPlaceholder')} 
              className={`w-full ${i18n.language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3 mb-12">
        {categories.map((cat, idx) => (
          <Button 
            key={idx}
            variant={selectedCategory === cat ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-6 py-2.5 ${selectedCategory === cat ? 'shadow-blue-200' : 'border-slate-200 text-slate-600 hover:border-blue-600'}`}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {filteredCourses.map((course, index) => (
          <motion.div 
            key={course.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index % 4 * 0.1 }}
            whileHover={{ y: -15 }}
            className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden flex flex-col h-full group transition-all duration-500 hover:shadow-[0_40px_80px_rgba(37,99,235,0.1)]"
          >
            <div className="relative h-64 overflow-hidden bg-slate-100">
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                loading="lazy"
                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest">
                  {t('courses.exploreContent')}
                </div>
              </div>
              <div className={`absolute top-6 ${i18n.language === 'ar' ? 'right-6' : 'left-6'} bg-white/90 backdrop-blur-xl px-5 py-2 rounded-2xl text-xs font-black text-blue-600 shadow-xl border border-white`}>
                {course.category}
              </div>
              {course.isFree && (
                <div className={`absolute top-6 ${i18n.language === 'ar' ? 'left-6' : 'right-6'} bg-teal-500 px-5 py-2 rounded-2xl text-xs font-black text-white shadow-xl border border-teal-400`}>
                  {t('common.free')}
                </div>
              )}
            </div>
            
            <div className={`p-10 flex-grow flex flex-col ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
              <h3 className="text-2xl font-black text-slate-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">{course.title}</h3>
              <p className="text-slate-500 text-base mb-8 line-clamp-3 flex-grow leading-relaxed font-medium">{course.description}</p>
              
              <div className={`flex items-center gap-4 mb-8 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse justify-end'}`}>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className={i18n.language === 'ar' ? 'text-right' : 'text-left'}>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{t('courses.instructor')}</div>
                  <div className="text-sm text-slate-900 font-black">{course.instructor}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <Rating initialRating={course.rating || 0} readonly size="sm" />
                  <span className="text-[10px] text-slate-400 font-bold">({course.ratingCount || 0})</span>
                </div>
                <div className="text-2xl font-black text-blue-600">
                  {course.isFree ? `0 ${t('common.currency')}` : `${course.price} ${t('common.currency')}`}
                </div>
              </div>
              
              <Link to={`/courses/${course.id}`} className="mt-10">
                <Button variant="dark" className="w-full py-5 rounded-[1.5rem] text-lg shadow-slate-200 group-hover:bg-blue-600 group-hover:shadow-blue-500/20">
                  {t('courses.viewCourse')}
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{t('courses.noResults')}</h3>
          <p className="text-slate-500">{t('courses.noResultsDesc')}</p>
        </div>
      )}
    </div>
  );
}
