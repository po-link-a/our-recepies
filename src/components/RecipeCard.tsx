import React from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { Recipe, CATEGORIES } from '../data/recipes';
import { CategoryIcon } from './Illustrations';

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
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <article className="card card--link recipe-card" onClick={() => onSelect(recipe.slug)}>
      <div className="recipe-card__top">
        <span className="chip" style={{ backgroundColor: categoryInfo?.bgColor }}>
          <CategoryIcon name={categoryInfo?.iconName || 'waffle'} size={16} />
          {recipe.categoryName}
        </span>

        <div className="recipe-card__tools">
          <span className="lang-tag">{recipe.language}</span>
          <button
            onClick={(e) => onToggleFavorite(recipe.id, e)}
            className={`bookmark-btn ${isFavorite ? 'bookmark-btn--on' : ''}`}
            title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          >
            <Bookmark size={17} fill={isFavorite ? '#D93A2B' : 'none'} />
          </button>
        </div>
      </div>

      {recipe.isArchive && <span className="ribbon">из бабушкиных вырезок</span>}

      {recipe.isIncomplete && <span className="warn__badge">неполный скан</span>}

      <h3 className="recipe-card__title">{recipe.title}</h3>

      <p className="recipe-card__note">{recipe.sourceNote}</p>

      <div className="recipe-card__foot">
        {totalTime > 0 && <span>{totalTime} мин</span>}
        {totalTime > 0 && recipe.servings && <span>·</span>}
        {recipe.servings && <span>{recipe.servings} порций</span>}

        <button
          onClick={(e) => onToggleLike(recipe.id, e)}
          className={`recipe-card__like ${isLiked ? 'recipe-card__like--on' : ''}`}
        >
          <Heart size={13} fill={isLiked ? '#D93A2B' : 'none'} />
          {recipe.likes}
        </button>
      </div>
    </article>
  );
};
