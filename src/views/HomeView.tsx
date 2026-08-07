import React from 'react';
import { ArrowRight, Sparkles, BookOpen, Flame, Heart, FileText } from 'lucide-react';
import { RECIPES, CATEGORIES, Recipe, DishCategory } from '../data/recipes';
import { HeroPotIllustration, CategoryIcon } from '../components/Illustrations';
import { RecipeCard } from '../components/RecipeCard';
import { AdPlaceholder } from '../components/AdPlaceholder';

interface HomeViewProps {
  onNavigate: (view: string, param?: string) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  likedRecipeIds: string[];
  favoriteRecipeIds: string[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onToggleLike,
  onToggleFavorite,
  likedRecipeIds,
  favoriteRecipeIds,
}) => {
  // Recipe of the day (deterministic based on day of year)
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const recipeOfTheDay = RECIPES[dayOfYear % RECIPES.length];

  // Top Most Popular (by likes)
  const popularRecipes = [...RECIPES].sort((a, b) => b.likes - a.likes).slice(0, 6);

  // Grandma's Clippings archive showcase
  const archiveRecipes = RECIPES.filter((r) => r.isArchive).slice(0, 6);

  // Recently Added
  const recentRecipes = [...RECIPES].slice(0, 6);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-[#FFFDF7] border-b border-stone-200/80 py-10 sm:py-16 overflow-hidden relative">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#F7E7A9] px-3.5 py-1.5 rounded-full text-stone-900 font-bold text-xs uppercase tracking-wider shadow-xs">
              <Sparkles className="w-4 h-4 text-[#D93A2B]" /> Душевные семейные рецепты
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-tight">
              Бабушкина шкатулка рецептов <span className="swash-peach">в цифре</span>
            </h1>

            <p className="text-lg text-stone-600 font-sans max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              72 драгоценных рецепта из семейных архивных выписок, старых газетных вырезок и тетрадей на русском, украинском и французском языках.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button onClick={() => onNavigate('all')} className="btn-primary">
                Смотреть все 72 рецепта <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('category', 'waffles')}
                className="btn-secondary"
              >
                Вафли и выпечка
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <HeroPotIllustration className="w-full max-w-md h-auto hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 space-y-12">
        {/* Ad Placeholder 1: Below Hero */}
        <AdPlaceholder type="hero_below" />

        {/* Recipe of the Day Highlight */}
        <section className="paper-card p-6 sm:p-8 bg-gradient-to-r from-[#FFFDF7] to-[#FAF6EE] border-2 border-[#D93A2B]/20">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="bg-[#D93A2B] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> Рецепт дня
            </span>
            <span className="text-xs text-stone-500 font-mono">Обновляется ежедневно</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3">
              <span className="text-xs font-bold text-[#D93A2B] uppercase tracking-wider">
                {recipeOfTheDay.categoryName} · {recipeOfTheDay.language}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {recipeOfTheDay.title}
              </h2>
              <p className="text-stone-600 text-sm line-clamp-2">
                {recipeOfTheDay.sourceNote} — {recipeOfTheDay.directions[0]}
              </p>
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button
                onClick={() => onNavigate('recipe', recipeOfTheDay.slug)}
                className="btn-primary w-full md:w-auto"
              >
                Приготовить <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Category Tiles Grid */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-serif text-3xl font-bold text-stone-900">Категории кулинарии</h2>
            <p className="text-stone-600 text-sm">Выбирайте из 10 тематических разделов нашей семейной коллекции</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Object.values(CATEGORIES).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigate('category', cat.id)}
                className="paper-card p-4 text-center flex flex-col items-center justify-center gap-2 hover:border-[#D93A2B] group"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs"
                  style={{ backgroundColor: cat.bgColor }}
                >
                  <CategoryIcon name={cat.iconName} size={28} className="text-stone-900" />
                </div>
                <span className="font-serif font-bold text-sm text-stone-900 group-hover:text-[#D93A2B] transition-colors">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Most Popular Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-300 pb-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#D93A2B] fill-[#D93A2B]" /> Самые популярные
            </h2>
            <button onClick={() => onNavigate('all')} className="text-sm font-semibold text-[#D93A2B] hover:underline">
              Смотреть все →
            </button>
          </div>

          <div className="recipe-grid">
            {popularRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={(slug) => onNavigate('recipe', slug)}
                onToggleLike={onToggleLike}
                onToggleFavorite={onToggleFavorite}
                isLiked={likedRecipeIds.includes(recipe.id)}
                isFavorite={favoriteRecipeIds.includes(recipe.id)}
              />
            ))}
          </div>
        </section>

        {/* Ad Placeholder 2: Section Between */}
        <AdPlaceholder type="section_between" />

        {/* Grandma's Clippings Archive Showcase */}
        <section className="paper-card p-6 sm:p-8 bg-[#FFF9E6] border-2 border-dashed border-[#D9822B]/40 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D9822B]/20 pb-4">
            <div>
              <span className="clipping-ribbon mb-1">
                <FileText className="w-4 h-4" /> бабушкин архив
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Из старых газетных вырезок
              </h2>
            </div>
            <p className="text-xs text-stone-600 max-w-md font-sans">
              Оригинальные газетные вырезки, сохраненные с советских времен («ДК», «Летний обед», «Холодный буфет»).
            </p>
          </div>

          <div className="recipe-grid">
            {archiveRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={(slug) => onNavigate('recipe', slug)}
                onToggleLike={onToggleLike}
                onToggleFavorite={onToggleFavorite}
                isLiked={likedRecipeIds.includes(recipe.id)}
                isFavorite={favoriteRecipeIds.includes(recipe.id)}
              />
            ))}
          </div>
        </section>

        {/* Recently Added Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-300 pb-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Недавно добавленные
            </h2>
            <button onClick={() => onNavigate('all')} className="text-sm font-semibold text-[#D93A2B] hover:underline">
              Все рецепты →
            </button>
          </div>

          <div className="recipe-grid">
            {recentRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={(slug) => onNavigate('recipe', slug)}
                onToggleLike={onToggleLike}
                onToggleFavorite={onToggleFavorite}
                isLiked={likedRecipeIds.includes(recipe.id)}
                isFavorite={favoriteRecipeIds.includes(recipe.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
