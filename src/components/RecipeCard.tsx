import React from 'react';
import { Clock, Users, Heart, Bookmark, AlertCircle, FileText } from 'lucide-react';
import { Recipe, CATEGORIES } from '../data/recipes';
import { CategoryIcon, TagMicroIcon } from './Illustrations';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (slug: string) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  isLiked: boolean;
  isFavorite: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect,
  onToggleLike,
  onToggleFavorite,
  isLiked,
  isFavorite,
}) => {
  const categoryInfo = CATEGORIES[recipe.category];

  return (
    <div
      onClick={() => onSelect(recipe.slug)}
      className="paper-card p-5 flex flex-col justify-between cursor-pointer group hover:border-[#D93A2B]/40"
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div
            className="category-chip"
            style={{ backgroundColor: categoryInfo?.bgColor || '#FAF6EE' }}
          >
            <CategoryIcon name={categoryInfo?.iconName || 'waffle'} size={16} />
            <span className="text-stone-900 font-semibold text-xs">{recipe.categoryName}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold bg-[#FAF6EE] text-stone-600 border border-stone-200 px-1.5 py-0.5 rounded">
              {recipe.language}
            </span>
            <button
              onClick={(e) => onToggleFavorite(recipe.id, e)}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-[#D93A2B] transition-colors"
              title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-[#D93A2B] text-[#D93A2B]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Grandma Clipping Ribbon */}
        {recipe.isArchive && (
          <div className="mb-2">
            <span className="clipping-ribbon">
              <FileText className="w-3.5 h-3.5 stroke-2" /> из бабушкиных вырезок
            </span>
          </div>
        )}

        {/* Incomplete Clipping Alert */}
        {recipe.isIncomplete && (
          <div className="mb-2">
            <span className="incomplete-badge">
              <AlertCircle className="w-3.5 h-3.5" /> неполный скан
            </span>
          </div>
        )}

        {/* Recipe Title */}
        <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#D93A2B] transition-colors leading-snug mb-2 line-clamp-2">
          {recipe.title}
        </h3>

        {/* Source note / Snippet */}
        <p className="text-xs text-stone-500 italic mb-4 font-sans line-clamp-1">
          {recipe.sourceNote}
        </p>
      </div>

      {/* Footer Meta Row */}
      <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-600">
        <div className="flex items-center gap-3">
          {(recipe.prepTimeMinutes || recipe.cookTimeMinutes) && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>
                {(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)} мин
              </span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span>{recipe.servings} порций</span>
            </div>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => onToggleLike(recipe.id, e)}
          className={`flex items-center gap-1 py-1 px-2.5 rounded-full border transition-all ${
            isLiked
              ? 'bg-[#F8D7DA] border-[#D93A2B] text-[#D93A2B] font-bold'
              : 'border-stone-200 hover:border-stone-400 text-stone-600'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#D93A2B] text-[#D93A2B]' : ''}`} />
          <span>{recipe.likes}</span>
        </button>
      </div>
    </div>
  );
};
