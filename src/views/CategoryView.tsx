import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, Search, Sparkles } from 'lucide-react';
import { RECIPES, CATEGORIES, Recipe, DishCategory, SituationalTag } from '../data/recipes';
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
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Category Header Banner */}
      <div className="paper-card p-6 sm:p-8 bg-[#FFFDF7] border-b-4 border-[#D93A2B] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {categoryInfo ? (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-xs"
                style={{ backgroundColor: categoryInfo.bgColor }}
              >
                <CategoryIcon name={categoryInfo.iconName} size={32} />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#F7E7A9] flex items-center justify-center text-stone-900 font-bold text-xl">
                72
              </div>
            )}
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                {categoryInfo ? categoryInfo.name : 'Все рецепты коллекции'}
              </h1>
              <p className="text-stone-600 text-sm mt-1">
                {categoryInfo ? categoryInfo.description : 'Полный архив 72 рецептов нашей семьи'}
              </p>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-stone-500">
            Найдено: <strong className="text-[#D93A2B] text-base">{filteredRecipes.length}</strong> рецептов
          </div>
        </div>

        {/* Local Search inside list */}
        <div className="pt-2">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Фильтр по названию или ингредиенту..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-[#FAF6EE] border border-stone-300 rounded-full py-2 pl-10 pr-4 text-sm text-stone-900 focus:outline-none focus:border-[#D93A2B]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </div>
        </div>
      </div>

      {/* Situational Tags Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
          <span className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-[#D93A2B]" /> Ситуативные ярлыки-фильтры:
          </span>
          {activeTags.length > 0 && (
            <button
              onClick={() => setActiveTags([])}
              className="text-[#D93A2B] hover:underline"
            >
              Сбросить ({activeTags.length})
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(TAG_LABELS) as SituationalTag[]).map((tagKey) => {
            const isSelected = activeTags.includes(tagKey);
            const tagData = TAG_LABELS[tagKey];
            return (
              <button
                key={tagKey}
                onClick={() => toggleTag(tagKey)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-[#D93A2B] text-white border-[#D93A2B] shadow-xs'
                    : 'bg-[#FFFDF7] text-stone-700 border-stone-300 hover:border-stone-400'
                }`}
              >
                {tagData.icon && <TagMicroIcon name={tagData.icon} className="w-3.5 h-3.5" />}
                <span>{tagData.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sorting & Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              activeCategory === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
            }`}
          >
            Все
          </button>
          {Object.values(CATEGORIES).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 text-xs text-stone-600 font-semibold self-end">
          <SlidersHorizontal className="w-4 h-4 text-stone-400" /> Сортировка:
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-[#FFFDF7] border border-stone-300 rounded-lg px-2 py-1 text-xs text-stone-900 font-medium focus:outline-none"
          >
            <option value="popular">Сначала популярные</option>
            <option value="newest">Сначала новые</option>
            <option value="name">По алфавиту (А-Я)</option>
          </select>
        </div>
      </div>

      {/* Recipe Grid with In-Grid Ad Placement */}
      {filteredRecipes.length > 0 ? (
        <div className="recipe-grid">
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
              {(index + 1) % 8 === 0 && (
                <div className="col-span-full">
                  <AdPlaceholder type="in_grid" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="paper-card p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#FAF6EE] border-2 border-stone-300 flex items-center justify-center mx-auto text-stone-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">Рецепты не найдены</h3>
          <p className="text-sm text-stone-600">
            Попробуйте сбросить фильтры или изменить поисковый запрос.
          </p>
          <button
            onClick={() => {
              setActiveTags([]);
              setActiveCategory('all');
              setLocalSearch('');
            }}
            className="btn-primary"
          >
            Сбросить все фильтры
          </button>
        </div>
      )}
    </div>
  );
};
