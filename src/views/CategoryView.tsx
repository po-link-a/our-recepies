import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { RECIPES, CATEGORIES, DishCategory, SituationalTag } from '../data/recipes';
import { RecipeCard } from '../components/RecipeCard';
import { CategoryIcon, TagMicroIcon } from '../components/Illustrations';
import { AdPlaceholder } from '../components/AdPlaceholder';

interface CategoryViewProps {
  selectedCategory?: string;
  searchQueryParam?: string;
  onNavigate: (view: string, param?: string) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  likedRecipeIds: string[];
  favoriteRecipeIds: string[];
}

const TAG_LABELS: Record<SituationalTag, { label: string; icon: string }> = {
  quick: { label: 'Быстро (≤30 мин)', icon: 'quick' },
  pantry: { label: 'Из того, что всегда есть', icon: 'pantry' },
  guests: { label: 'Для гостей / праздник', icon: 'guests' },
  kids: { label: 'Готовим с детьми', icon: 'kids' },
  archive: { label: 'Бабушкины вырезки', icon: 'archive' },
  lang_ru: { label: 'Русский (RU)', icon: '' },
  lang_uk: { label: 'Українська (UK)', icon: '' },
  lang_fr: { label: 'Français (FR)', icon: '' },
};

export const CategoryView: React.FC<CategoryViewProps> = ({
  selectedCategory,
  searchQueryParam = '',
  onNavigate,
  onToggleLike,
  onToggleFavorite,
  likedRecipeIds,
  favoriteRecipeIds,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategory || 'all');
  const [activeTags, setActiveTags] = useState<SituationalTag[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'name'>('popular');
  const [localSearch, setLocalSearch] = useState(searchQueryParam);

  const categoryInfo = activeCategory !== 'all' ? CATEGORIES[activeCategory as DishCategory] : null;

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return RECIPES.filter((recipe) => {
      // Category filter
      if (activeCategory !== 'all' && recipe.category !== activeCategory) {
        return false;
      }
      // Tag filters (AND match)
      if (activeTags.length > 0) {
        const matchesTags = activeTags.every((tag) => recipe.tags.includes(tag));
        if (!matchesTags) return false;
      }
      // Search query
      if (localSearch.trim()) {
        const q = localSearch.toLowerCase();
        const titleMatch = recipe.title.toLowerCase().includes(q);
        const ingredientMatch = recipe.ingredients.some((i) => i.name.toLowerCase().includes(q));
        const sourceMatch = recipe.sourceNote.toLowerCase().includes(q);
        if (!titleMatch && !ingredientMatch && !sourceMatch) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.likes - a.likes;
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [activeCategory, activeTags, sortBy, localSearch]);

  const toggleTag = (tag: SituationalTag) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  return (
    <div className="container page">
      {/* Header */}
      <div className="row" style={{ alignItems: 'flex-start', gap: 18, marginBottom: 18 }}>
        {categoryInfo && (
          <span className="cat-tile__icon" style={{ backgroundColor: categoryInfo.bgColor }}>
            <CategoryIcon name={categoryInfo.iconName} size={30} />
          </span>
        )}
        <div>
          <span className="kicker">
            {categoryInfo ? categoryInfo.description : 'Полный архив 72 рецептов нашей семьи'}
          </span>
          <h1 className="hero__title" style={{ fontSize: 52, margin: '4px 0 0' }}>
            {categoryInfo ? categoryInfo.name : 'Все рецепты коллекции'}
          </h1>
        </div>
        <span className="count push">
          Найдено: <strong>{filteredRecipes.length}</strong> рецептов
        </span>
      </div>

      {/* Local search */}
      <div className="search" style={{ maxWidth: 420, marginBottom: 26 }}>
        <div className="search__form">
          <Search size={16} className="search__icon" />
          <input
            type="text"
            placeholder="Фильтр по названию или ингредиенту..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="search__input"
          />
        </div>
      </div>

      {/* Situational tag filters */}
      <div className="filters">
        <div className="filters__label">
          <span>Ситуативные ярлыки-фильтры</span>
          {activeTags.length > 0 && (
            <button onClick={() => setActiveTags([])} className="filters__reset push">
              Сбросить ({activeTags.length})
            </button>
          )}
        </div>

        <div className="row-wrap">
          {(Object.keys(TAG_LABELS) as SituationalTag[]).map((tagKey) => {
            const isSelected = activeTags.includes(tagKey);
            const tagData = TAG_LABELS[tagKey];
            return (
              <button
                key={tagKey}
                onClick={() => toggleTag(tagKey)}
                className={`pill ${isSelected ? 'pill--active' : ''}`}
              >
                {tagData.icon && <TagMicroIcon name={tagData.icon} />}
                {tagData.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category tabs + sorting */}
      <div className="sortbar">
        <div className="sortbar__tabs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`pill ${activeCategory === 'all' ? 'pill--active' : ''}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            Все
          </button>
          {Object.values(CATEGORIES).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`pill ${activeCategory === cat.id ? 'pill--active' : ''}`}
              style={{ whiteSpace: 'nowrap' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="sortbar__sort">
          <span className="filters__label" style={{ margin: 0 }}>
            Сортировка
          </span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="sortbar__select"
          >
            <option value="popular">Сначала популярные</option>
            <option value="newest">Сначала новые</option>
            <option value="name">По алфавиту (А-Я)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid-3">
          {filteredRecipes.map((recipe, index) => (
            <React.Fragment key={recipe.id}>
              <RecipeCard
                recipe={recipe}
                onSelect={(slug) => onNavigate('recipe', slug)}
                onToggleLike={onToggleLike}
                onToggleFavorite={onToggleFavorite}
                isLiked={likedRecipeIds.includes(recipe.id)}
                isFavorite={favoriteRecipeIds.includes(recipe.id)}
              />
              {/* Insert Ad every 8 cards */}
              {(index + 1) % 8 === 0 && <AdPlaceholder type="in_grid" />}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="empty">
          <span className="empty__icon">
            <Search size={24} />
          </span>
          <h3 className="empty__title">Рецепты не найдены</h3>
          <p className="empty__text">Попробуйте сбросить фильтры или изменить поисковый запрос.</p>
          <button
            onClick={() => {
              setActiveTags([]);
              setActiveCategory('all');
              setLocalSearch('');
            }}
            className="btn btn--primary"
          >
            Сбросить все фильтры
          </button>
        </div>
      )}
    </div>
  );
};
