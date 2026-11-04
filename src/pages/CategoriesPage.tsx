import React from 'react';
import { motion } from 'motion/react';
import { 
  Shirt, 
  Armchair, 
  Tv, 
  Smartphone, 
  BookOpen, 
  Gamepad2, 
  Baby, 
  Utensils, 
  Sparkles, 
  Bike, 
  Hammer, 
  Sprout, 
  ShoppingBag, 
  Package,
  ArrowRight
} from 'lucide-react';
import { CATEGORIES } from '@/config/constants';
import { useTranslation } from '@/contexts/TranslationContext';

interface CategoriesPageProps {
  onNavigate: (page: string, params?: any) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Shirt,
  Armchair,
  Tv,
  Smartphone,
  BookOpen,
  Gamepad2,
  Baby,
  Utensils,
  Sparkles,
  Bike,
  Hammer,
  Sprout,
  ShoppingBag,
  Package
};

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto space-y-2"
      >
        <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full">
          {t('cat.title')}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 via-purple-900 to-amber-700">
          {t('cat.title')}
        </h1>
        <p className="text-sm text-gray-600">
          {t('cat.subtitle')}
        </p>
      </motion.div>

      {/* Grid of categories with Motion animations and vibrant gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((cat, index) => {
          const Icon = ICON_MAP[cat.iconName] || Package;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => onNavigate('explore', { category: cat.name })}
              className="bg-white/90 backdrop-blur-xs rounded-3xl p-6 border border-gray-200/80 hover:border-emerald-500 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer group relative overflow-hidden"
            >
              {/* Top ambient glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 via-emerald-500/10 to-amber-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

              <div className="space-y-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center group-hover:scale-110 group-hover:from-purple-600 group-hover:to-amber-500 transition-all shadow-md">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 group-hover:text-emerald-800 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-800 relative z-10">
                <span>{t('hero.cta.explore')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-amber-500" />
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};
