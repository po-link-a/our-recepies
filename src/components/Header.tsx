import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, BookOpen, Menu, X, Sparkles, ChevronDown } from 'lucide-react';
import { RECIPES, CATEGORIES, DishCategory, Recipe } from '../data/recipes';
import { CategoryIcon } from './Illustrations';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  favoritesCount: number;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, favoritesCount }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Typeahead instant search suggestions
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase();
      const matches = RECIPES.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.ingredients.some((ing) => ing.name.toLowerCase().includes(q))
      ).slice(0, 5);
      setSuggestions(matches);
      setIsSearchOpen(true);
    } else {
      setSuggestions([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search', searchQuery.trim());
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF7]/95 backdrop-blur-md border-b border-stone-800/10 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
          <div className="w-11 h-11 rounded-full bg-[#FAF6EE] border-2 border-[#D93A2B] flex items-center justify-center text-[#D93A2B] group-hover:scale-105 transition-transform shadow-xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 block leading-none">
              Семейные Рецепты
            </span>
            <span className="font-hand text-sm text-[#D93A2B] block leading-none mt-1">
              кулинарная книга нашей семьи
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <button
            onClick={() => onNavigate('home')}
            className={`font-medium text-sm transition-colors ${
              currentView === 'home' ? 'text-[#D93A2B] font-bold' : 'text-stone-700 hover:text-[#D93A2B]'
            }`}
          >
            Главная
          </button>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className="flex items-center gap-1 font-medium text-sm text-stone-700 hover:text-[#D93A2B] transition-colors py-2"
            >
              Категории <ChevronDown className="w-4 h-4" />
            </button>

            {isCategoryMenuOpen && (
              <div
                className="absolute top-full left-0 mt-1 w-72 bg-[#FFFDF7] border border-stone-200 rounded-xl shadow-xl p-2 grid grid-cols-1 gap-1 z-50"
                onMouseLeave={() => setIsCategoryMenuOpen(false)}
              >
                {Object.values(CATEGORIES).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onNavigate('category', cat.id);
                      setIsCategoryMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#FAF6EE] text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.bgColor }}>
                      <CategoryIcon name={cat.iconName} size={18} className="text-stone-900" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-stone-900">{cat.name}</div>
                      <div className="text-xs text-stone-500 truncate max-w-[170px]">{cat.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('all')}
            className={`font-medium text-sm transition-colors ${
              currentView === 'all' ? 'text-[#D93A2B] font-bold' : 'text-stone-700 hover:text-[#D93A2B]'
            }`}
          >
            Все рецепты (72)
          </button>
        </nav>

        {/* Search Bar + Typeahead */}
        <div className="relative flex-1 max-w-sm hidden md:block" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Поиск по названиям и ингредиентам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setIsSearchOpen(true)}
              className="w-full bg-[#FAF6EE] border border-stone-300 focus:border-[#D93A2B] rounded-full py-2 pl-10 pr-4 text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </form>

          {/* Typeahead Suggestions */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFDF7] border border-stone-200 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-2 text-xs font-semibold text-stone-400 border-b border-stone-100 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D93A2B]" /> Найдено в рецептах
              </div>
              {suggestions.length > 0 ? (
                <div>
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate('recipe', item.slug);
                        setIsSearchOpen(false);
                      }}
                      className="w-full p-2.5 text-left hover:bg-[#FAF6EE] flex items-center justify-between gap-2 border-b border-stone-100 last:border-none"
                    >
                      <div>
                        <div className="text-sm font-semibold text-stone-900 line-clamp-1">{item.title}</div>
                        <div className="text-xs text-stone-500">{item.categoryName} · {item.sourceNote}</div>
                      </div>
                      <span className="text-xs bg-[#FAF6EE] text-[#D93A2B] px-2 py-0.5 rounded font-mono">{item.language}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-sm text-stone-500 text-center">Ничего не найдено</div>
              )}
            </div>
          )}
        </div>

        {/* Actions (Favorites + Mobile menu trigger) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('favorites')}
            className="btn-icon relative"
            title="Избранные рецепты"
          >
            <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'fill-[#D93A2B] text-[#D93A2B]' : ''}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D93A2B] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-stone-700 hover:text-[#D93A2B]"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FFFDF7] border-b border-stone-200 px-4 py-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Поиск рецептов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF6EE] border border-stone-300 rounded-full py-2 pl-10 pr-4 text-sm text-stone-900"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200">
            <button
              onClick={() => {
                onNavigate('home');
                setIsMobileMenuOpen(false);
              }}
              className="text-left font-semibold text-stone-800 p-2 hover:bg-[#FAF6EE] rounded-lg"
            >
              Главная
            </button>
            <button
              onClick={() => {
                onNavigate('all');
                setIsMobileMenuOpen(false);
              }}
              className="text-left font-semibold text-stone-800 p-2 hover:bg-[#FAF6EE] rounded-lg"
            >
              Все рецепты (72)
            </button>
            <button
              onClick={() => {
                onNavigate('favorites');
                setIsMobileMenuOpen(false);
              }}
              className="text-left font-semibold text-[#D93A2B] p-2 hover:bg-[#FAF6EE] rounded-lg col-span-2 flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current" /> Избранные ({favoritesCount})
            </button>
          </div>

          <div className="pt-2 border-t border-stone-200">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Категории:</div>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.values(CATEGORIES).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onNavigate('category', cat.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-sm text-stone-700 p-1.5 hover:text-[#D93A2B] truncate"
                >
                  • {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
