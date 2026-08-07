import React, { useState } from 'react';
import {
  Clock,
  Users,
  Heart,
  Bookmark,
  Share2,
  Printer,
  Download,
  FileText,
  AlertCircle,
  Play,
  ChevronRight,
  CheckSquare,
  Square,
  Copy,
  Check
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { Recipe, RECIPES, CATEGORIES } from '../data/recipes';
import { CategoryIcon, DecorativeDoodle } from '../components/Illustrations';
import { RecipeCard } from '../components/RecipeCard';
import { AdPlaceholder } from '../components/AdPlaceholder';
import { CookingModeModal } from '../components/CookingModeModal';

interface RecipeDetailViewProps {
  recipe: Recipe;
  onNavigate: (view: string, param?: string) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  isLiked: boolean;
  isFavorite: boolean;
  likedRecipeIds: string[];
  favoriteRecipeIds: string[];
}

export const RecipeDetailView: React.FC<RecipeDetailViewProps> = ({
  recipe,
  onNavigate,
  onToggleLike,
  onToggleFavorite,
  isLiked,
  isFavorite,
  likedRecipeIds,
  favoriteRecipeIds,
}) => {
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [isCookingModeOpen, setIsCookingModeOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const categoryInfo = CATEGORIES[recipe.category];

  // Related recipes from same category
  const relatedRecipes = RECIPES.filter(
    (r) => r.category === recipe.category && r.id !== recipe.id
  ).slice(0, 4);

  const toggleIngredientCheck = (idx: number) => {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Generate Word (.docx) export
  const handleDownloadDocx = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: recipe.title,
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Категория: ${recipe.categoryName} | Источник: ${recipe.sourceNote}`,
                  italics: true,
                }),
              ],
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'Ингредиенты:',
              heading: HeadingLevel.HEADING_2,
            }),
            ...recipe.ingredients.map((ing) => {
              const amountStr = ing.amount
                ? ` ${Math.round(ing.amount * portionMultiplier * 100) / 100} ${ing.unit || ''}`
                : '';
              const noteStr = ing.note ? ` (${ing.note})` : '';
              return new Paragraph({
                text: `• ${ing.name}${amountStr}${noteStr}`,
              });
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'Приготовление:',
              heading: HeadingLevel.HEADING_2,
            }),
            ...recipe.directions.map((step, idx) => {
              return new Paragraph({
                text: `${idx + 1}. ${step}`,
              });
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '— Семейная коллекция рецептов (our-recepies)',
                  size: 18,
                  italics: true,
                  color: '888888',
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.slug}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-sans">
        <button onClick={() => onNavigate('home')} className="hover:text-[#D93A2B]">
          Главная
        </button>
        <ChevronRight className="w-3 h-3 text-stone-400" />
        <button onClick={() => onNavigate('category', recipe.category)} className="hover:text-[#D93A2B]">
          {recipe.categoryName}
        </button>
        <ChevronRight className="w-3 h-3 text-stone-400" />
        <span className="text-stone-800 font-semibold truncate max-w-xs">{recipe.title}</span>
      </nav>

      {/* Main Grid: Content + Sidebar Ad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Main Recipe Card */}
          <article className="paper-card p-6 sm:p-10 bg-[#FFFDF7] space-y-6">
            {/* Header badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <span
                  className="category-chip"
                  style={{ backgroundColor: categoryInfo?.bgColor || '#FAF6EE' }}
                >
                  <CategoryIcon name={categoryInfo?.iconName || 'waffle'} size={18} />
                  <span className="text-stone-900 font-bold">{recipe.categoryName}</span>
                </span>
                <span className="text-xs font-mono font-bold bg-[#FAF6EE] text-stone-700 border border-stone-300 px-2 py-0.5 rounded">
                  {recipe.language}
                </span>
              </div>

              {/* Action buttons (Like, Favorite, Share, Print) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => onToggleLike(recipe.id, e)}
                  className={`btn-secondary text-xs py-1 px-3 ${
                    isLiked ? 'bg-[#F8D7DA] border-[#D93A2B] text-[#D93A2B]' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#D93A2B]' : ''}`} /> {recipe.likes}
                </button>

                <button
                  onClick={(e) => onToggleFavorite(recipe.id, e)}
                  className="btn-icon w-9 h-9"
                  title="В избранное"
                >
                  <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-[#D93A2B] text-[#D93A2B]' : ''}`} />
                </button>

                <button onClick={handleCopyLink} className="btn-icon w-9 h-9" title="Поделиться">
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>

                <button onClick={handlePrint} className="btn-icon w-9 h-9 no-print" title="Распечатать">
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grandma Clipping Ribbon & Incomplete Alert */}
            {recipe.isArchive && (
              <div>
                <span className="clipping-ribbon">
                  <FileText className="w-4 h-4" /> {recipe.sourceNote}
                </span>
              </div>
            )}

            {recipe.isIncomplete && (
              <div className="p-3 bg-[#FFF0F0] border border-[#E0B4B4] rounded-xl flex items-start gap-3 text-xs text-[#D93A2B]">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <strong>Неполный архивный скан:</strong> {recipe.incompleteNote || 'Фрагмент рецепта обрезается на скане.'}
                </div>
              </div>
            )}

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight">
              {recipe.title}
            </h1>

            {/* Meta Stats Row */}
            <div className="flex flex-wrap items-center gap-6 py-3 px-4 bg-[#FAF6EE] rounded-xl border border-stone-200 text-sm text-stone-700 font-medium">
              {(recipe.prepTimeMinutes || recipe.cookTimeMinutes) && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D93A2B]" />
                  <span>
                    Время: <strong>{(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)} мин</strong>
                  </span>
                </div>
              )}

              {recipe.servings && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D93A2B]" />
                  <span>
                    Порций: <strong>{Math.round(recipe.servings * portionMultiplier)}</strong>
                  </span>
                </div>
              )}

              {/* Cooking Mode Launch Button */}
              <button
                onClick={() => setIsCookingModeOpen(true)}
                className="btn-primary text-xs ml-auto py-1.5 px-3.5 shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Режим готовки
              </button>
            </div>

            {/* Downloads Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2 no-print">
              <button onClick={handleDownloadDocx} className="btn-secondary text-xs py-1.5 px-3">
                <Download className="w-3.5 h-3.5 text-[#2B4BD9]" /> Скачать Word (.docx)
              </button>
              <button onClick={handlePrint} className="btn-secondary text-xs py-1.5 px-3">
                <Download className="w-3.5 h-3.5 text-[#D93A2B]" /> Сохранить в PDF / Друк
              </button>
            </div>

            <hr className="dotted-divider" />

            {/* Recipe Anatomy: INGREDIENTS */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
                  <span className="swash-green">Ингредиенты</span>
                </h2>

                {/* Portion Scaler */}
                {recipe.ingredients.some((i) => i.amount) && (
                  <div className="flex items-center gap-1 bg-[#FAF6EE] p-1 rounded-lg border border-stone-300 text-xs font-bold">
                    <span className="text-stone-500 px-1">Порции:</span>
                    {[0.5, 1, 2].map((m) => (
                      <button
                        key={m}
                        onClick={() => setPortionMultiplier(m)}
                        className={`px-2 py-0.5 rounded ${
                          portionMultiplier === m ? 'bg-[#D93A2B] text-white' : 'text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        ×{m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ingredients Checklist */}
              <div className="bg-[#FAF6EE]/70 rounded-xl p-5 border border-stone-200 space-y-2.5">
                {recipe.ingredients.map((ing, idx) => {
                  const isChecked = !!checkedIngredients[idx];
                  const calculatedAmount = ing.amount
                    ? Math.round(ing.amount * portionMultiplier * 100) / 100
                    : null;

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleIngredientCheck(idx)}
                      className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? 'line-through text-stone-400 bg-stone-100' : 'hover:bg-[#FFFDF7] text-stone-900'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-[#D93A2B] flex-shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="text-sm font-medium flex-1">
                        <span>{ing.name}</span>
                        {calculatedAmount && (
                          <strong className="text-[#D93A2B] font-semibold ml-1">
                            — {calculatedAmount} {ing.unit || ''}
                          </strong>
                        )}
                        {ing.note && <span className="text-xs text-stone-500 italic ml-1">({ing.note})</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Ad Placeholder inside Content */}
            <AdPlaceholder type="recipe_in_content" />

            {/* Recipe Anatomy: DIRECTIONS */}
            <section className="space-y-4 pt-4">
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                <span className="swash-yellow">Приготовление</span>
              </h2>

              <div className="space-y-4">
                {recipe.directions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#D93A2B] text-white font-serif font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      {idx + 1}
                    </div>
                    <p className="text-base text-stone-800 leading-relaxed pt-1">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </article>

          {/* Ad Placeholder below content */}
          <AdPlaceholder type="recipe_below" />

          {/* Related Recipes from Category */}
          {relatedRecipes.length > 0 && (
            <section className="space-y-4 pt-6">
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                Ещё из категории «{recipe.categoryName}»
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedRecipes.map((rel) => (
                  <RecipeCard
                    key={rel.id}
                    recipe={rel}
                    onSelect={(slug) => onNavigate('recipe', slug)}
                    onToggleLike={onToggleLike}
                    onToggleFavorite={onToggleFavorite}
                    isLiked={likedRecipeIds.includes(rel.id)}
                    isFavorite={favoriteRecipeIds.includes(rel.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Sticky Ad Column (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="paper-card p-6 bg-[#FFFDF7] space-y-4 sticky top-24">
            <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
              <DecorativeDoodle type="lemon" className="w-6 h-6" />
              <h4 className="font-serif font-bold text-stone-900">О коллекции</h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Все рецепты собраны из семейного архива (15 оригинальных сканов). Сохранен оригинальный текст и язык (RU / UK / FR).
            </p>

            <AdPlaceholder type="recipe_sidebar" />
          </div>
        </div>
      </div>

      {/* Kitchen Cooking Mode Modal */}
      {isCookingModeOpen && (
        <CookingModeModal recipe={recipe} onClose={() => setIsCookingModeOpen(false)} />
      )}
    </div>
  );
};
