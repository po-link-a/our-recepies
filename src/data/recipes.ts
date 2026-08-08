import recipesData from './recipes.json';

export interface RecipeIngredient {
  name: string;
  amount?: number;
  unit?: string;
  note?: string;
  group?: string;
}

export type DishCategory =
  | 'waffles'
  | 'pancakes'
  | 'pies_baking'
  | 'dough'
  | 'desserts'
  | 'salads'
  | 'soups'
  | 'meat'
  | 'fish'
  | 'vegetables';

export type SituationalTag =
  | 'quick'
  | 'pantry'
  | 'guests'
  | 'kids'
  | 'archive'
  | 'lang_ru'
  | 'lang_uk'
  | 'lang_fr';

export interface CategoryInfo {
  id: DishCategory;
  name: string;
  nameUk?: string;
  nameFr?: string;
  iconName: string;
  description: string;
  bgColor: string;
}

export const CATEGORIES: Record<DishCategory, CategoryInfo> = {
  waffles: {
    id: 'waffles',
    name: 'Вафли',
    iconName: 'waffle',
    description: 'Хрустящие, сладкие, творожные и сытные закусочные вафли',
    bgColor: '#F7E7A9'
  },
  pancakes: {
    id: 'pancakes',
    name: 'Блины и блинчики',
    iconName: 'pancake',
    description: 'Тонкие блинчики, гречневые, манные и блинные торты',
    bgColor: '#F4CBB2'
  },
  pies_baking: {
    id: 'pies_baking',
    name: 'Пирожки, булки и выпечка',
    iconName: 'pirozhok',
    description: 'Жареные и печеные пирожки, пышные булки и круассаны',
    bgColor: '#E2E9D8'
  },
  dough: {
    id: 'dough',
    name: 'Базовое тесто',
    iconName: 'rollingpin',
    description: 'Универсальное заварное, дрожжевое и под водой («Водолаз»)',
    bgColor: '#ECE0D1'
  },
  desserts: {
    id: 'desserts',
    name: 'Сладкое и десерты',
    iconName: 'cake',
    description: 'Профитроли, рогалики, кексы, ягодные желе и печенье',
    bgColor: '#F8D7DA'
  },
  salads: {
    id: 'salads',
    name: 'Салаты и закуски',
    iconName: 'salad',
    description: 'Летние овощные салаты, фаршированные яйца, веррины и муссы',
    bgColor: '#D1E7DD'
  },
  soups: {
    id: 'soups',
    name: 'Супы и холодники',
    iconName: 'soup',
    description: 'Таратор, холодник по-мински, морковный кремовый суп и томатный',
    bgColor: '#CFE2FF'
  },
  meat: {
    id: 'meat',
    name: 'Мясо и птица',
    iconName: 'meat',
    description: 'Сочные крученики, телятина с вишней, душенина и мусака',
    bgColor: '#F8D7DA'
  },
  fish: {
    id: 'fish',
    name: 'Рыба и морепродукты',
    iconName: 'fish',
    description: 'Рыбные салаты, крокеты, рёсти и тарты с тунцом',
    bgColor: '#CFF4FC'
  },
  vegetables: {
    id: 'vegetables',
    name: 'Овощные блюда',
    iconName: 'casserole',
    description: 'Запеканки, фаршированные баклажаны, рагу и рататуй',
    bgColor: '#E2E9D8'
  }
};

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  category: DishCategory;
  categoryName: string;
  tags: SituationalTag[];
  language: 'RU' | 'UK' | 'FR';
  sourceNote: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  ingredients: RecipeIngredient[];
  directions: string[];
  isArchive: boolean;
  isIncomplete?: boolean;
  incompleteNote?: string;
  likes: number;
  createdAt: string;
  /** Photos of the original clipping, e.g. ["/scans/simple-waffles.jpg"] */
  scans?: string[];
}

/**
 * Recipe data lives in recipes.json so the Telegram bot can append to it
 * with a plain JSON read-modify-write. Types and CATEGORIES stay here.
 */
export const RECIPES: Recipe[] = recipesData as Recipe[];
