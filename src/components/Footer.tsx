import React from 'react';
import { BookOpen, Heart, FileText, Globe } from 'lucide-react';
import { CATEGORIES } from '../data/recipes';
import { AdPlaceholder } from './AdPlaceholder';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#FFFDF7] border-t border-stone-200 mt-16 pt-12 pb-8 text-stone-700">
      <div className="container mx-auto px-4 space-y-10">
        {/* Footer Ad Placement */}
        <AdPlaceholder type="footer" />

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
              <BookOpen className="w-6 h-6 text-[#D93A2B]" />
              <span className="font-serif text-xl font-bold text-stone-900">
                Семейные Рецепты
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Оцифрованная коллекция из 72 домашних рецептов, собранных из газетных вырезок, старых кулинарных купонов и брошюр на русском, украинском и французском языках.
            </p>
          </div>

          {/* Category Sitemap */}
          <div className="md:col-span-5 space-y-2">
            <h4 className="font-serif font-bold text-sm text-stone-900 uppercase tracking-wider">
              Карта категорий
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              {Object.values(CATEGORIES).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onNavigate('category', cat.id)}
                  className="text-left text-stone-600 hover:text-[#D93A2B] transition-colors"
                >
                  • {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Languages & Meta info */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <h4 className="font-serif font-bold text-sm text-stone-900 uppercase tracking-wider">
              Языки архива
            </h4>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-[#FAF6EE] border border-stone-200 rounded font-mono font-bold">RU</span>
              <span className="px-2 py-1 bg-[#FAF6EE] border border-stone-200 rounded font-mono font-bold">UK</span>
              <span className="px-2 py-1 bg-[#FAF6EE] border border-stone-200 rounded font-mono font-bold">FR</span>
            </div>
            <p className="text-stone-500 pt-2">
              Все тексты сохранены дословно, без искажений оригинала.
            </p>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="border-t border-stone-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <span>© {new Date().getFullYear()} Семейная Коллекция Рецептов — по материалам домашнего архива.</span>
          <span className="flex items-center gap-1">
            Сделано с любовью и теплом <Heart className="w-3.5 h-3.5 fill-[#D93A2B] text-[#D93A2B]" />
          </span>
        </div>
      </div>
    </footer>
  );
};
