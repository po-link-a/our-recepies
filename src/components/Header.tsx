import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, Menu, X, ChevronDown } from 'lucide-react';
import { RECIPES, CATEGORIES, Recipe } from '../data/recipes';
import { CategoryIcon, BookMark } from './Illustrations';

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
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="site-header no-print">
      <div className="site-header__inner">
        {/* Brand */}
        <div className="brand" onClick={() => onNavigate('home')}>
          <BookMark />
          <div>
            <span className="brand__name">Семейные Рецепты</span>
            <span className="brand__tag">кулинарная книга нашей семьи</span>
          </div>
        </div>

        {/* Desktop navigation */}
        <nav className="nav">
          <button
            onClick={() => onNavigate('home')}
            className={`nav__link ${currentView === 'home' ? 'nav__link--active' : ''}`}
          >
            Главная
          </button>

          <div className="nav__group">
            <button
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className="nav__link nav__caret"
            >
              Категории <ChevronDown size={15} />
            </button>

            {isCategoryMenuOpen && (
              <div className="dropdown" onMouseLeave={() => setIsCategoryMenuOpen(false)}>
                {Object.values(CATEGORIES).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onNavigate('category', cat.id);
                      setIsCategoryMenuOpen(false);
                    }}
                    className="dropdown__item"
                  >
                    <span className="dropdown__icon" style={{ backgroundColor: cat.bgColor }}>
                      <CategoryIcon name={cat.iconName} size={20} />
                    </span>
                    <span>
                      <span className="dropdown__name">{cat.name}</span>
                      <span className="dropdown__desc">{cat.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('all')}
            className={`nav__link ${currentView === 'all' ? 'nav__link--active' : ''}`}
          >
            Все рецепты (72)
          </button>
        </nav>

        {/* Search + typeahead */}
        <div className="search" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="search__form">
            <Search size={16} className="search__icon" />
            <input
              type="text"
              placeholder="Поиск по названиям и ингредиентам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setIsSearchOpen(true)}
              className="search__input"
            />
          </form>

          {isSearchOpen && (
            <div className="typeahead">
              <div className="typeahead__head">Найдено в рецептах</div>
              {suggestions.length > 0 ? (
                suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate('recipe', item.slug);
                      setIsSearchOpen(false);
                    }}
                    className="typeahead__item"
                  >
                    <span>
                      <span className="typeahead__title">{item.title}</span>
                      <span className="typeahead__meta">
                        {item.categoryName} · {item.sourceNote}
                      </span>
                    </span>
                    <span className="lang-tag">{item.language}</span>
                  </button>
                ))
              ) : (
                <div className="typeahead__empty">Ничего не найдено</div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="row" style={{ gap: 10, marginLeft: 'auto' }}>
          <button
            onClick={() => onNavigate('favorites')}
            className="icon-btn"
            title="Избранные рецепты"
          >
            <Heart size={18} fill={favoritesCount > 0 ? '#D93A2B' : 'none'} color={favoritesCount > 0 ? '#D93A2B' : 'currentColor'} />
            {favoritesCount > 0 && <span className="icon-btn__count">{favoritesCount}</span>}
          </button>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="burger">
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <div className="drawer">
          <div className="drawer__section">
            <form onSubmit={handleSearchSubmit} className="search__form">
              <Search size={16} className="search__icon" />
              <input
                type="text"
                placeholder="Поиск рецептов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search__input"
              />
            </form>
          </div>

          <div className="drawer__section">
            <div className="drawer__links">
              <button
                onClick={() => {
                  onNavigate('home');
                  setIsMobileMenuOpen(false);
                }}
                className="drawer__link"
              >
                Главная
              </button>
              <button
                onClick={() => {
                  onNavigate('all');
                  setIsMobileMenuOpen(false);
                }}
                className="drawer__link"
              >
                Все рецепты (72)
              </button>
              <button
                onClick={() => {
                  onNavigate('favorites');
                  setIsMobileMenuOpen(false);
                }}
                className="drawer__link drawer__link--wide"
              >
                <Heart size={16} fill="#D93A2B" color="#D93A2B" /> Избранные ({favoritesCount})
              </button>
            </div>
          </div>

          <div className="drawer__section">
            <div className="drawer__label">Категории</div>
            <div className="drawer__links">
              {Object.values(CATEGORIES).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onNavigate('category', cat.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className="drawer__link"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
