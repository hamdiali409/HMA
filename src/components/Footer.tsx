import { GraduationCap, Mail, Phone, MapPin, Instagram, Youtube, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';

export default function Footer() {
  const { t, i18n } = useTranslation();
  
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-8 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
          <div className="col-span-1 md:col-span-2">
            <div className={`flex items-center gap-2 text-white font-bold text-2xl mb-4 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse justify-end'}`}>
              <Logo className="text-white" />
            </div>
            <p className="text-slate-400 max-w-md">
              {i18n.language === 'ar' 
                ? 'أكاديمية هما الطبية (HMA) هي المنصة الرائدة للتعليم الطبي المتخصص. نقدم تجربة تعليمية مخصصة ومحتوى علمي دقيق يساعدك على التفوق في مسيرتك الطبية.'
                : 'HMA Medical Academy is the leading platform for specialized medical education. We provide a personalized learning experience and accurate scientific content to help you excel in your medical career.'}
            </p>
            <div className={`flex gap-4 mt-6 ${i18n.language === 'ar' ? 'justify-start' : 'justify-start'}`}>
              <a href="#" className="hover:text-blue-500 transition-colors"><Instagram className="h-6 w-6" /></a>
              <a href="#" className="hover:text-red-500 transition-colors"><Youtube className="h-6 w-6" /></a>
              <a href="#" className="hover:text-blue-400 transition-colors"><Send className="h-6 w-6" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{i18n.language === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h3>
            <ul className="space-y-2">
              <li><Link to="/courses" className="hover:text-blue-400 transition-colors">{t('common.courses')}</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">{i18n.language === 'ar' ? 'عن المنصة' : 'About Us'}</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-blue-400 transition-colors">{i18n.language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">{i18n.language === 'ar' ? 'إخلاء مسؤولية طبية' : 'Medical Disclaimer'}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{i18n.language === 'ar' ? 'اتصل بنا' : 'Contact Us'}</h3>
            <ul className="space-y-3">
              <li className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse justify-end'}`}><Mail className="h-4 w-4 text-blue-500" /> support@hma-academy.com</li>
              <li className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse justify-end'}`}><Phone className="h-4 w-4 text-blue-500" /> +249 123 885 443</li>
              <li className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse justify-end'}`}><MapPin className="h-4 w-4 text-blue-500" /> {i18n.language === 'ar' ? 'الخرطوم، السودان' : 'Khartoum, Sudan'}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} {i18n.language === 'ar' ? 'أكاديمية هما الطبية (HMA). جميع الحقوق محفوظة.' : 'HMA Medical Academy. All rights reserved.'}
        </div>
      </div>
    </footer>
  );
}
