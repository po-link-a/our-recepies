/**
 * Telegram bot that turns a photo of a recipe clipping into a page on the site.
 *
 * Flow: photo -> Gemini transcribes it -> preview in Telegram -> edit or approve
 * -> commit to src/data/recipes.json + public/scans/ -> Vercel redeploys the site.
 *
 * Webhook URL: https://<your-vercel-domain>/api/tg/recipe
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

export const config = { maxDuration: 60 };

/**
 * Vercel kills the function at maxDuration, and a killed function never
 * replies — the chat just goes silent. Stop short of that and say something.
 */
const TIME_BUDGET_MS = 50_000;
let deadline = 0;
const msLeft = () => deadline - Date.now();

// ---------------------------------------------------------------- environment

const TG_TOKEN = process.env.TG_BOT_TOKEN || '';
const TG_SECRET = process.env.TG_WEBHOOK_SECRET || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const GH_REPO = process.env.GITHUB_REPO || '';
const GH_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GH_TOKEN = process.env.GITHUB_TOKEN || '';
const SITE_ORIGIN = (process.env.SITE_ORIGIN || '').replace(/\/$/, '');

/** Only these chat ids may talk to the bot. No fallback: empty means nobody. */
const ALLOWED = (process.env.TG_CHAT_ID || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const RECIPES_PATH = 'src/data/recipes.json';
const SCANS_DIR = 'public/scans';
/** First one wins; the rest are fallbacks. Override with GEMINI_MODEL. */
const GEMINI_MODELS = (process.env.GEMINI_MODEL || 'gemini-flash-latest,gemini-2.0-flash')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Built on first use, not at import: a missing Upstash variable would otherwise
 * throw during module load and crash the function before it can report anything.
 *
 * Accepts both namings — Vercel's Upstash integration injects KV_REST_API_*,
 * while a database created directly at upstash.com gives UPSTASH_REDIS_REST_*.
 */
let _redis: Redis | null = null;
function redis(): Redis {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error('База не подключена: не заданы UPSTASH_REDIS_REST_URL / _TOKEN');
  }
  return (_redis = new Redis({ url, token }));
}

// ------------------------------------------------------------------ constants

/** Mirrors CATEGORIES in src/data/recipes.ts — keep the two in sync. */
const CATEGORY_NAMES: Record<string, string> = {
  waffles: 'Вафли',
  pancakes: 'Блины и блинчики',
  pies_baking: 'Пирожки, булки и выпечка',
  dough: 'Базовое тесто',
  desserts: 'Сладкое и десерты',
  salads: 'Салаты и закуски',
  soups: 'Супы и холодники',
  meat: 'Мясо и птица',
  fish: 'Рыба и морепродукты',
  vegetables: 'Овощные блюда',
};
const CATEGORY_IDS = Object.keys(CATEGORY_NAMES);

/** Recipes are published in Russian; this names the clipping's own language. */
const ORIGINAL_LANGUAGES: Record<'RU' | 'UK' | 'FR', string> = {
  RU: 'русского',
  UK: 'украинского',
  FR: 'французского',
};

const FIELD_LABELS: Record<string, string> = {
  title: 'Название',
  source: 'Источник',
  category: 'Категория',
  servings: 'Порции',
  time: 'Время',
  ingredients: 'Ингредиенты',
  directions: 'Приготовление',
};

// ---------------------------------------------------------------------- types

interface Ingredient {
  name: string;
  amount?: number;
  unit?: string;
  note?: string;
}

interface DraftRecipe {
  title: string;
  language: 'RU' | 'UK' | 'FR';
  category: string;
  sourceNote: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  ingredients: Ingredient[];
  directions: string[];
  isIncomplete?: boolean;
  incompleteNote?: string;
}

interface Draft {
  step: 'review' | 'editing' | 'awaiting_photo';
  fileIds: string[];
  recipe: DraftRecipe;
  editField?: string;
}

// ------------------------------------------------------------ telegram helpers

async function tg(method: string, body: unknown): Promise<any> {
  const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!json?.ok) console.error(`tg.${method} failed`, JSON.stringify(json).slice(0, 400));
  return json;
}

/** Telegram caps messages at 4096 characters. */
function clip(text: string, max = 3900): string {
  return text.length <= max ? text : `${text.slice(0, max)}\n…(текст обрезан)`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function say(chatId: number | string, text: string, keyboard?: unknown) {
  return tg('sendMessage', {
    chat_id: chatId,
    text: clip(text),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...(keyboard ? { reply_markup: keyboard } : {}),
  });
}

async function downloadTelegramFile(fileId: string): Promise<Buffer> {
  const info = await tg('getFile', { file_id: fileId });
  const path = info?.result?.file_path;
  if (!path) throw new Error('Не удалось получить файл из Telegram');
  const res = await fetch(`https://api.telegram.org/file/bot${TG_TOKEN}/${path}`);
  if (!res.ok) throw new Error(`Не удалось скачать файл: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ------------------------------------------------------------------ draft state

const draftKey = (chatId: number | string) => `recipe:draft:${chatId}`;

const getDraft = (chatId: number | string) =>
  redis().get<Draft>(draftKey(chatId)).catch(() => null);

const setDraft = (chatId: number | string, draft: Draft) =>
  redis().set(draftKey(chatId), draft, { ex: 60 * 60 * 24 });

const clearDraft = (chatId: number | string) => redis().del(draftKey(chatId));

/** Telegram re-sends updates it thinks failed; process each one only once. */
async function alreadyHandled(updateId: number): Promise<boolean> {
  const fresh = await redis().set(`recipe:seen:${updateId}`, 1, { nx: true, ex: 3600 });
  return fresh === null;
}

// ---------------------------------------------------------------------- Gemini

const GEMINI_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    language: { type: 'string', enum: ['RU', 'UK', 'FR'] },
    category: { type: 'string', enum: CATEGORY_IDS },
    sourceNote: { type: 'string' },
    servings: { type: 'integer' },
    prepTimeMinutes: { type: 'integer' },
    cookTimeMinutes: { type: 'integer' },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          amount: { type: 'number' },
          unit: { type: 'string' },
          note: { type: 'string' },
        },
        required: ['name'],
      },
    },
    directions: { type: 'array', items: { type: 'string' } },
    isIncomplete: { type: 'boolean' },
    incompleteNote: { type: 'string' },
  },
  required: ['title', 'language', 'category', 'ingredients', 'directions'],
};

const GEMINI_PROMPT = `Ты ПЕРЕПИСЧИК рецептов. Ты переносишь текст с фотографии в структуру — ты не редактор, не автор и не составитель краткого пересказа.

═══ ГЛАВНОЕ ПРАВИЛО ═══
На выходе должно быть ВСЁ, что написано на фото, слово в слово. Полнота важнее краткости.

СТРОГО ЗАПРЕЩЕНО:
— сокращать абзацы и заменять их короткой фразой;
— выбрасывать пояснения, советы, предупреждения и оговорки автора («иначе тесто не поднимется», «не ленитесь всё хорошенько перемешать», «я рекомендую делать это венчиком»);
— объединять несколько абзацев в один;
— пересказывать своими словами;
— добавлять то, чего на фото нет.

Проверь себя перед ответом: если абзац на фото состоит из пяти предложений, в твоём ответе должно быть пять предложений. Если ты написал короче оригинала — ты ошибся, вернись и перепиши полностью.

═══ ЯЗЫК ═══
— Текст на фото РУССКИЙ → копируй дословно, буква в букву. Никакого перефразирования, даже мелкого.
— Текст УКРАИНСКИЙ или ФРАНЦУЗСКИЙ → переведи на русский максимально дословно. Сохрани все предложения, их порядок и длину. Ничего не выбрасывай при переводе.
— language — язык ОРИГИНАЛА на фото: RU, UK или FR. Это поле не о переводе, а о том, на каком языке была вырезка.

═══ ПОЛЯ ═══
directions:
— Каждый абзац оригинала = отдельный элемент массива, в том же порядке.
— Вступительные и заключительные абзацы («Вот все ингредиенты, которые нам понадобятся…», «Из указанного количества получается 12–15 блинчиков…», «Чтобы проверить, пропеклись ли…») тоже включай — это часть рецепта.
— Подписи под фотографиями — тоже шаги, включай их.
— Не нумеруй элементы сам, нумерация добавится позже.

ingredients:
— name — название, amount — число, unit — ТОЛЬКО короткая единица измерения («г», «мл», «шт», «ст. ложка», «ч. ложка», «стакан»).
— В unit не должно быть цифр, латинских слов, знаков «=», пояснений и второй меры.
— Если указано две меры («30 г / 2 ст. ложки»), первая идёт в amount + unit, вторая целиком в note.
— Если количества нет («по вкусу») — amount и unit оставь пустыми, а текст положи в note.
— Величины НЕ пересчитывай.

title — название блюда по-русски. Если названия на фото нет, коротко опиши блюдо по составу.
category — ближайшая из списка.
sourceNote — только если на фото видно название издания, сайта, рубрики или подпись. Названия НЕ переводи, оставь как есть («art-lunch.ru», «Cuisine et Vins de France»). Иначе оставь пустым.
servings — только если на фото сказано, сколько порций или штук получается.
Время — только если оно есть на фото.
isIncomplete — true, если часть текста обрезана, нечитаема или продолжается за краем фото; опиши проблему в incompleteNote.

Никаких приписок об источнике («записано со слов бабушки», «семейный рецепт»), если этого нет на фото.
Если на фото несколько страниц одного рецепта — объедини их в один рецепт, сохранив весь текст.`;

const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

/**
 * Optional generationConfig settings, in the order we give them up on a 400.
 * Each returns true if it changed something, so the caller can retry once per
 * rung. Ordered by what we can most afford to lose.
 */
const CONFIG_FALLBACKS: { name: string; apply: (c: any) => boolean }[] = [
  {
    name: 'thinkingConfig',
    apply: (c) => 'thinkingConfig' in c && (delete c.thinkingConfig, true),
  },
  {
    name: 'maxOutputTokens=8192',
    apply: (c) => c.maxOutputTokens > 8192 && ((c.maxOutputTokens = 8192), true),
  },
  {
    name: 'maxOutputTokens',
    apply: (c) => 'maxOutputTokens' in c && (delete c.maxOutputTokens, true),
  },
  {
    name: 'temperature',
    apply: (c) => 'temperature' in c && (delete c.temperature, true),
  },
];

/** A 404 means the model name is retired, not that the request was bad. */
class ModelGoneError extends Error {}

/** Ran out of function time — report it rather than let Vercel kill us. */
class OutOfTimeError extends Error {}

async function callGemini(model: string, images: Buffer[]): Promise<DraftRecipe> {
  const body: { contents: unknown; systemInstruction: unknown; generationConfig: any } = {
    contents: [
      {
        role: 'user',
        parts: [
          ...images.map((img) => ({
            inline_data: { mime_type: 'image/jpeg', data: img.toString('base64') },
          })),
          { text: 'Расшифруй рецепт с этих фотографий.' },
        ],
      },
    ],
    systemInstruction: { parts: [{ text: GEMINI_PROMPT }] },
    generationConfig: {
      // Transcription wants determinism, and room to reproduce long recipes in
      // full — the default output cap is what makes models start summarising.
      temperature: 0,
      maxOutputTokens: 16384,
      // Copying text needs no deliberation, and thinking is most of the
      // latency that was pushing us past Vercel's 60s ceiling.
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: 'application/json',
      responseSchema: GEMINI_SCHEMA,
    },
  };

  let lastError = 'неизвестная ошибка';
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1500 * attempt));
    // Don't start a call we can't finish — better a clear message than silence.
    if (msLeft() < 12_000) throw new OutOfTimeError(lastError);

    let res: Response;
    try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(Math.max(5_000, msLeft() - 4_000)),
        }
      );
    } catch (err: any) {
      // The abort signal fired: Gemini is still generating but we're out of time.
      if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
        throw new OutOfTimeError(`${model}: превышено время ожидания`);
      }
      throw err;
    }

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 200);
      if (res.status === 404) throw new ModelGoneError(`${model}: ${detail}`);

      // Models disagree about the optional knobs — and Google reports it as a
      // bare "invalid argument" without naming the field. Shed them one by one
      // rather than guess which one this model dislikes.
      if (res.status === 400) {
        const shed = CONFIG_FALLBACKS.find((f) => f.apply(body.generationConfig));
        if (shed) {
          console.warn(`gemini: "${model}" 400 — dropping ${shed.name}. Detail: ${detail}`);
          attempt--;
          continue;
        }
      }

      lastError = `Gemini ${res.status}: ${detail}`;
      if (RETRYABLE.has(res.status)) continue;
      throw new Error(lastError);
    }

    const json: any = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';
    if (!text) {
      lastError = 'Gemini вернул пустой ответ';
      continue;
    }
    try {
      return normalize(JSON.parse(text));
    } catch {
      lastError = 'Не удалось разобрать ответ Gemini';
    }
  }
  throw new Error(lastError);
}

/** Models this key can actually use, best vision candidate first. */
async function listUsableModels(): Promise<string[]> {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', {
    headers: { 'x-goog-api-key': GEMINI_KEY },
  });
  if (!res.ok) return [];
  const json: any = await res.json();

  return (json.models || [])
    .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m: any) => String(m.name).replace(/^models\//, ''))
    .filter((n: string) => /^gemini-/.test(n) && !/embedding|aqa|tts|imagen|veo|image/.test(n))
    .sort((a: string, b: string) => rankModel(b) - rankModel(a));
}

/** Newer beats older; flash beats pro — fast and cheap is right for OCR. */
function rankModel(name: string): number {
  const version = name.match(/gemini-(\d+)(?:[.-](\d+))?/);
  const major = version ? Number(version[1]) : 0;
  const minor = version?.[2] ? Number(version[2]) : 0;
  return (
    major * 100 +
    minor * 10 +
    (name.includes('flash') ? 5 : 0) +
    (name.includes('latest') ? 3 : 0) -
    (name.includes('lite') ? 4 : 0) -
    (/preview|exp/.test(name) ? 2 : 0)
  );
}

/**
 * Google retires model names on its own schedule, so a hardcoded one eventually
 * 404s. Try the configured names, then fall back to whatever the key can see —
 * the bot repairs itself instead of going dark until someone redeploys.
 */
async function geminiExtract(images: Buffer[]): Promise<DraftRecipe> {
  const queue = [...GEMINI_MODELS];
  const tried: string[] = [];
  let discovered = false;
  let lastError = 'неизвестная ошибка';

  while (queue.length) {
    const model = queue.shift()!;
    if (tried.includes(model)) continue;
    tried.push(model);

    try {
      const recipe = await callGemini(model, images);
      if (model !== GEMINI_MODELS[0]) {
        console.warn(`gemini: using "${model}" — set GEMINI_MODEL to pin it`);
      }
      return recipe;
    } catch (err) {
      if (!(err instanceof ModelGoneError)) throw err;
      lastError = err.message;
      console.warn(`gemini: "${model}" is no longer available`);

      if (!queue.length && !discovered) {
        discovered = true;
        const available = await listUsableModels();
        queue.push(...available.filter((m) => !tried.includes(m)).slice(0, 3));
        if (!queue.length) {
          throw new Error('Ни одна модель Gemini не доступна этому ключу. Проверьте GEMINI_API_KEY.');
        }
      }
    }
  }
  throw new Error(lastError);
}

/**
 * A unit is a short word with no digits — "г", "мл", "ст. ложка". Models
 * sometimes cram a second measure in there ("г prescription: 1 ч. ложка"),
 * which then renders as garbage next to the amount. Keep the unit, demote
 * the rest to a note.
 */
function splitUnit(raw: string): { unit?: string; note?: string } {
  const value = raw.trim().replace(/\s+/g, ' ');
  if (!value) return {};
  // No digits, symbols or stray Latin words — an ordinary unit, however wordy
  // ("г", "ч. ложка", "маленькая банка").
  if (!/[\d(\/,;=]/.test(value) && !/[а-яё]\s+[a-z]{3,}/i.test(value) && value.length <= 30) {
    return { unit: value };
  }

  // Cut at the first bracket, digit, symbol, or word introducing a second
  // measure. Note \b is ASCII-only in JS, so Cyrillic needs explicit spacing.
  const cut = value.search(/[(\/,;=]|\s(?:prescription|или|ou|or)[\s:]|\s[a-z]{3,}|\d/i);
  if (cut <= 0) return { note: value };

  const unit = value.slice(0, cut).trim().replace(/[\s:—–-]+$/, '');
  // Too long to be a unit — it's a sentence, so keep all of it as the note.
  if (unit.length > 20) return { note: value };

  const note = value
    .slice(cut)
    .replace(/^[(\/,;:\s—–-]+/, '')
    .replace(/^(?:prescription|или|ou|or)[\s:]+/i, '')
    .replace(/[)\s]+$/, '')
    .trim();

  // "resistance=" and friends are model noise, not a measurement. A real note
  // carries a number or actual words; bare ASCII with symbols carries neither.
  const keepNote = note && !/^[a-z=:\s]+$/i.test(note);

  return { ...(unit && unit.length <= 20 ? { unit } : {}), ...(keepNote ? { note } : {}) };
}

/** Gemini follows the schema but can still return blanks or an unknown category. */
function normalize(raw: any): DraftRecipe {
  const category = CATEGORY_IDS.includes(raw?.category) ? raw.category : 'desserts';
  const ingredients: Ingredient[] = (Array.isArray(raw?.ingredients) ? raw.ingredients : [])
    .filter((i: any) => i?.name?.trim())
    .map((i: any) => {
      const { unit, note } = splitUnit(String(i.unit || ''));
      const notes = [note, String(i.note || '').trim()].filter(Boolean).join('; ');
      return {
        name: String(i.name).trim(),
        ...(typeof i.amount === 'number' && i.amount > 0 ? { amount: i.amount } : {}),
        ...(unit ? { unit } : {}),
        ...(notes ? { note: notes } : {}),
      };
    });

  return {
    title: String(raw?.title || '').trim() || 'Без названия',
    language: ['RU', 'UK', 'FR'].includes(raw?.language) ? raw.language : 'RU',
    category,
    sourceNote: String(raw?.sourceNote || '').trim(),
    ...(raw?.prepTimeMinutes > 0 ? { prepTimeMinutes: raw.prepTimeMinutes } : {}),
    ...(raw?.cookTimeMinutes > 0 ? { cookTimeMinutes: raw.cookTimeMinutes } : {}),
    ...(raw?.servings > 0 ? { servings: raw.servings } : {}),
    ingredients,
    directions: (Array.isArray(raw?.directions) ? raw.directions : [])
      .map((d: any) => String(d).trim())
      .filter(Boolean),
    ...(raw?.isIncomplete ? { isIncomplete: true } : {}),
    ...(raw?.incompleteNote?.trim() ? { incompleteNote: String(raw.incompleteNote).trim() } : {}),
  };
}

// ----------------------------------------------------------------------- slugs

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', ґ: 'g', д: 'd', е: 'e', ё: 'e', є: 'ie', ж: 'zh',
  з: 'z', и: 'i', і: 'i', ї: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip French accents
    .split('')
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return base || `recipe-${Date.now()}`;
}

function uniqueSlug(title: string, taken: Set<string>): string {
  const base = slugify(title);
  if (!taken.has(base)) return base;
  for (let n = 2; n < 500; n++) {
    if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

// ---------------------------------------------------------------------- GitHub

async function gh(path: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`https://api.github.com/repos/${GH_REPO}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${GH_TOKEN}`,
      accept: 'application/vnd.github+json',
      'content-type': 'application/json',
      'user-agent': 'our-recepies-bot',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub ${init.method || 'GET'} ${path} → ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function readRecipes(): Promise<any[]> {
  const file = await gh(`/contents/${RECIPES_PATH}?ref=${GH_BRANCH}`);
  return JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
}

/**
 * Commits the updated recipes.json and every scan in a single commit, so the
 * site is never deployed with a recipe whose photos are missing.
 */
async function commitRecipe(
  recipesJson: string,
  scans: { path: string; bytes: Buffer }[],
  message: string
): Promise<void> {
  const ref = await gh(`/git/ref/heads/${GH_BRANCH}`);
  const headSha: string = ref.object.sha;
  const headCommit = await gh(`/git/commits/${headSha}`);

  // Binary files can't go inline in a tree — they need a base64 blob first.
  const blobs = await Promise.all(
    scans.map((s) =>
      gh('/git/blobs', {
        method: 'POST',
        body: JSON.stringify({ content: s.bytes.toString('base64'), encoding: 'base64' }),
      })
    )
  );

  const tree = await gh('/git/trees', {
    method: 'POST',
    body: JSON.stringify({
      base_tree: headCommit.tree.sha,
      tree: [
        { path: RECIPES_PATH, mode: '100644', type: 'blob', content: recipesJson },
        ...scans.map((s, i) => ({
          path: s.path,
          mode: '100644',
          type: 'blob',
          sha: blobs[i].sha,
        })),
      ],
    }),
  });

  const commit = await gh('/git/commits', {
    method: 'POST',
    body: JSON.stringify({ message, tree: tree.sha, parents: [headSha] }),
  });

  await gh(`/git/refs/heads/${GH_BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  });
}

// -------------------------------------------------------------------- keyboards

const reviewKeyboard = {
  inline_keyboard: [
    [{ text: '✅ Опубликовать', callback_data: 'pub' }],
    [
      { text: '✏️ Исправить', callback_data: 'edit' },
      { text: '📷 Добавить фото', callback_data: 'addph' },
    ],
    [
      { text: '🔄 Распознать заново', callback_data: 'redo' },
      { text: '✖️ Отмена', callback_data: 'cancel' },
    ],
  ],
};

const editKeyboard = {
  inline_keyboard: [
    [
      { text: 'Название', callback_data: 'ed:title' },
      { text: 'Категория', callback_data: 'ed:category' },
    ],
    [
      { text: 'Ингредиенты', callback_data: 'ed:ingredients' },
      { text: 'Приготовление', callback_data: 'ed:directions' },
    ],
    [
      { text: 'Время', callback_data: 'ed:time' },
      { text: 'Порции', callback_data: 'ed:servings' },
      { text: 'Источник', callback_data: 'ed:source' },
    ],
    [{ text: '‹ Назад', callback_data: 'back' }],
  ],
};

const categoryKeyboard = {
  inline_keyboard: [
    ...chunk(
      CATEGORY_IDS.map((id) => ({ text: CATEGORY_NAMES[id], callback_data: `cat:${id}` })),
      2
    ),
    [{ text: '‹ Назад', callback_data: 'back' }],
  ],
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ---------------------------------------------------------------------- preview

function formatIngredient(i: Ingredient): string {
  const qty = [i.amount, i.unit].filter(Boolean).join(' ');
  const note = i.note ? ` (${i.note})` : '';
  return qty ? `• ${i.name} — ${qty}${note}` : `• ${i.name}${note}`;
}

function renderPreview(r: DraftRecipe, photoCount: number): string {
  const time = (r.prepTimeMinutes || 0) + (r.cookTimeMinutes || 0);
  const meta = [
    CATEGORY_NAMES[r.category],
    r.language === 'RU' ? null : `перевод с ${ORIGINAL_LANGUAGES[r.language]}`,
    time > 0 ? `${time} мин` : null,
    r.servings ? `${r.servings} порц.` : null,
    photoCount > 1 ? `${photoCount} фото` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return [
    `<b>${esc(r.title)}</b>`,
    r.sourceNote ? `<i>${esc(r.sourceNote)}</i>` : null,
    meta,
    r.isIncomplete ? `\n⚠️ <i>${esc(r.incompleteNote || 'Часть текста не распозналась.')}</i>` : null,
    `\n<b>Ингредиенты</b>`,
    r.ingredients.length ? esc(r.ingredients.map(formatIngredient).join('\n')) : '—',
    `\n<b>Приготовление</b>`,
    r.directions.length
      ? esc(r.directions.map((d, i) => `${i + 1}. ${d}`).join('\n\n'))
      : '—',
  ]
    .filter(Boolean)
    .join('\n');
}

// ------------------------------------------------------------------ edit parsing

/** Parses "Мука — 200 г" / "Соль по вкусу" into an ingredient. */
function parseIngredientLine(line: string): Ingredient | null {
  const clean = line.replace(/^[•\-*\s]+/, '').trim();
  if (!clean) return null;

  const split = clean.split(/\s+[—–]\s+|\s+-\s+/);
  if (split.length < 2) return { name: clean };

  const name = split[0].trim();
  const qty = split.slice(1).join(' — ').trim();
  const match = qty.match(/^([\d]+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return { name, note: qty };

  const amount = parseFloat(match[1].replace(',', '.'));
  const unit = match[2].trim();
  return { name, amount, ...(unit ? { unit } : {}) };
}

function applyEdit(recipe: DraftRecipe, field: string, text: string): string | null {
  const value = text.trim();
  switch (field) {
    case 'title':
      recipe.title = value;
      return null;
    case 'source':
      recipe.sourceNote = value === '-' ? '' : value;
      return null;
    case 'servings': {
      const n = parseInt(value, 10);
      if (!n || n < 1) return 'Нужно число, например: 6';
      recipe.servings = n;
      return null;
    }
    case 'time': {
      const n = parseInt(value, 10);
      if (!n || n < 1) return 'Нужно число минут, например: 45';
      recipe.prepTimeMinutes = undefined;
      recipe.cookTimeMinutes = n;
      return null;
    }
    case 'ingredients': {
      const list = value.split('\n').map(parseIngredientLine).filter(Boolean) as Ingredient[];
      if (!list.length) return 'Не вижу ни одного ингредиента.';
      recipe.ingredients = list;
      return null;
    }
    case 'directions': {
      const steps = value
        .split(/\n{2,}|\n/)
        .map((s) => s.replace(/^\s*\d+[.)]\s*/, '').trim())
        .filter(Boolean);
      if (!steps.length) return 'Не вижу ни одного шага.';
      recipe.directions = steps;
      return null;
    }
    default:
      return 'Неизвестное поле.';
  }
}

const EDIT_HINTS: Record<string, string> = {
  title: 'Пришлите новое название одним сообщением.',
  source: 'Пришлите источник (например: Газетная вырезка «Летний обед»).\nЧтобы убрать источник, отправьте <code>-</code>',
  servings: 'Сколько порций? Пришлите число.',
  time: 'Сколько минут готовится? Пришлите число.',
  ingredients:
    'Пришлите список ингредиентов, по одному в строке:\n\n<code>Мука — 200 г\nЯйцо — 2 шт\nСоль — по вкусу</code>',
  directions: 'Пришлите шаги приготовления, каждый с новой строки.',
};

// ------------------------------------------------------------------- publishing

async function publish(chatId: number, draft: Draft): Promise<void> {
  const r = draft.recipe;
  const recipes = await readRecipes();
  const taken = new Set<string>(recipes.map((x: any) => x.slug));
  const slug = uniqueSlug(r.title, taken);

  const images = await Promise.all(draft.fileIds.map(downloadTelegramFile));
  const scans = images.map((bytes, i) => ({
    bytes,
    path: `${SCANS_DIR}/${slug}${i === 0 ? '' : `-${i + 1}`}.jpg`,
  }));

  const totalTime = (r.prepTimeMinutes || 0) + (r.cookTimeMinutes || 0);
  const tags = [
    'archive',
    `lang_${r.language.toLowerCase()}`,
    ...(totalTime > 0 && totalTime <= 30 ? ['quick'] : []),
  ];

  const record = {
    id: `tg-${slug}`,
    title: r.title,
    slug,
    category: r.category,
    categoryName: CATEGORY_NAMES[r.category],
    tags,
    language: r.language,
    sourceNote: r.sourceNote || 'Из семейного архива',
    ...(r.prepTimeMinutes ? { prepTimeMinutes: r.prepTimeMinutes } : {}),
    ...(r.cookTimeMinutes ? { cookTimeMinutes: r.cookTimeMinutes } : {}),
    ...(r.servings ? { servings: r.servings } : {}),
    ingredients: r.ingredients,
    directions: r.directions,
    // The text is Russian now; language records what the clipping itself was.
    ...(r.language !== 'RU' ? { translatedFrom: r.language } : {}),
    isArchive: true,
    ...(r.isIncomplete ? { isIncomplete: true, incompleteNote: r.incompleteNote } : {}),
    likes: 0,
    createdAt: new Date().toISOString().slice(0, 10),
    scans: scans.map((s) => `/${s.path.replace(/^public\//, '')}`),
  };

  // Newest first — the site's "Недавно добавленные" section reads from the top.
  recipes.unshift(record);

  await commitRecipe(
    `${JSON.stringify(recipes, null, 2)}\n`,
    scans,
    `recipe: добавлен «${r.title}»`
  );

  await clearDraft(chatId);

  const link = SITE_ORIGIN ? `\n\n${SITE_ORIGIN}/#/recipe/${slug}` : '';
  await say(
    chatId,
    `✅ Готово! «${esc(r.title)}» добавлен на сайт.\n\nСтраница появится через 1–2 минуты, пока сайт пересобирается.${link}\n\nМожно присылать следующее фото.`
  );
}

// --------------------------------------------------------------------- handlers

async function handlePhotos(chatId: number, fileIds: string[], append: boolean) {
  const existing = append ? await getDraft(chatId) : null;
  const allFileIds = existing ? [...existing.fileIds, ...fileIds].slice(0, 5) : fileIds;

  await say(
    chatId,
    '📖 Читаю фото. Это займёт около минуты — я переписываю весь текст с фотографии целиком.'
  );

  const images = await Promise.all(allFileIds.map(downloadTelegramFile));
  const recipe = await geminiExtract(images);

  await setDraft(chatId, { step: 'review', fileIds: allFileIds, recipe });
  await say(chatId, renderPreview(recipe, allFileIds.length), reviewKeyboard);
}

async function handleMessage(msg: any) {
  const chatId: number = msg.chat.id;
  const text: string = (msg.text || '').trim();

  if (text === '/start' || text === '/help') {
    await say(
      chatId,
      'Привет! Пришлите фотографию рецепта — вырезку, страницу тетради или рукописную запись.\n\n' +
        'Я прочитаю её и покажу, что получилось. Вы сможете что-то поправить, а потом нажать «Опубликовать» — и рецепт появится на сайте.\n\n' +
        'Команды:\n/cancel — отменить текущий рецепт'
    );
    return;
  }

  if (text === '/cancel') {
    await clearDraft(chatId);
    await say(chatId, 'Отменено. Присылайте новое фото, когда будете готовы.');
    return;
  }

  // Photo, either compressed or sent as an uncompressed file
  const photo = msg.photo?.length ? msg.photo[msg.photo.length - 1] : null;
  const doc = msg.document?.mime_type?.startsWith('image/') ? msg.document : null;
  const fileId = photo?.file_id || doc?.file_id;

  if (fileId) {
    if ((doc?.file_size || 0) > 8_000_000) {
      await say(chatId, 'Фото слишком большое. Пришлите его как обычное фото, а не как файл.');
      return;
    }
    const draft = await getDraft(chatId);
    const append = draft?.step === 'awaiting_photo';

    // Several photos sent at once arrive as separate updates sharing a group id.
    // The first invocation claims the group, waits for its siblings to register
    // their file ids, then reads them all in — so they become one recipe.
    if (msg.media_group_id) {
      const key = `recipe:group:${msg.media_group_id}`;
      await redis().rpush(key, fileId);
      await redis().expire(key, 300);
      const isLead = await redis().set(`${key}:lead`, 1, { nx: true, ex: 300 });
      if (isLead === null) return;
      await new Promise((r) => setTimeout(r, 3000));
      const fileIds = await redis().lrange(key, 0, -1);
      await handlePhotos(chatId, fileIds, append);
      return;
    }

    await handlePhotos(chatId, [fileId], append);
    return;
  }

  // Text answer to an edit prompt
  const draft = await getDraft(chatId);
  if (draft?.step === 'editing' && draft.editField && text) {
    const error = applyEdit(draft.recipe, draft.editField, text);
    if (error) {
      await say(chatId, `${error}\nПопробуйте ещё раз.`);
      return;
    }
    draft.step = 'review';
    draft.editField = undefined;
    await setDraft(chatId, draft);
    await say(chatId, renderPreview(draft.recipe, draft.fileIds.length), reviewKeyboard);
    return;
  }

  if (text) {
    await say(chatId, 'Пришлите, пожалуйста, фотографию рецепта. /help — как это работает.');
  }
}

async function handleCallback(cb: any) {
  const chatId: number = cb.message.chat.id;
  const data: string = cb.data || '';
  await tg('answerCallbackQuery', { callback_query_id: cb.id });

  const draft = await getDraft(chatId);
  if (!draft) {
    await say(chatId, 'Этот рецепт уже не в работе. Пришлите фото заново.');
    return;
  }

  if (data === 'cancel') {
    await clearDraft(chatId);
    await say(chatId, 'Отменено. Ничего не опубликовано.');
    return;
  }

  if (data === 'edit') {
    await say(chatId, 'Что поправить?', editKeyboard);
    return;
  }

  if (data === 'back') {
    draft.step = 'review';
    draft.editField = undefined;
    await setDraft(chatId, draft);
    await say(chatId, renderPreview(draft.recipe, draft.fileIds.length), reviewKeyboard);
    return;
  }

  if (data === 'addph') {
    draft.step = 'awaiting_photo';
    await setDraft(chatId, draft);
    await say(chatId, 'Пришлите следующее фото этого же рецепта — я прочитаю их вместе.');
    return;
  }

  if (data === 'redo') {
    await handlePhotos(chatId, [], true);
    return;
  }

  if (data === 'ed:category') {
    await say(chatId, 'Выберите категорию:', categoryKeyboard);
    return;
  }

  if (data.startsWith('cat:')) {
    const id = data.slice(4);
    if (!CATEGORY_IDS.includes(id)) return;
    draft.recipe.category = id;
    draft.step = 'review';
    await setDraft(chatId, draft);
    await say(chatId, renderPreview(draft.recipe, draft.fileIds.length), reviewKeyboard);
    return;
  }

  if (data.startsWith('ed:')) {
    const field = data.slice(3);
    if (!EDIT_HINTS[field]) return;
    draft.step = 'editing';
    draft.editField = field;
    await setDraft(chatId, draft);
    await say(chatId, `<b>${FIELD_LABELS[field]}</b>\n\n${EDIT_HINTS[field]}`);
    return;
  }

  if (data === 'pub') {
    await say(chatId, '📤 Публикую…');
    await publish(chatId, draft);
  }
}

// ----------------------------------------------------------------------- handler

export default async function handler(req: VercelRequest, res: VercelResponse) {
  deadline = Date.now() + TIME_BUDGET_MS;
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  if (TG_SECRET && req.headers['x-telegram-bot-api-secret-token'] !== TG_SECRET) {
    return res.status(401).send('Unauthorized');
  }

  const update = req.body;
  const chatId = update?.message?.chat?.id ?? update?.callback_query?.message?.chat?.id;

  // Silently ignore anyone who isn't on the allowlist.
  if (!chatId || !ALLOWED.includes(String(chatId))) {
    console.warn('rejected chat', chatId);
    return res.status(200).send('ok');
  }

  if (update.update_id && (await alreadyHandled(update.update_id))) {
    return res.status(200).send('ok');
  }

  try {
    if (update.callback_query) await handleCallback(update.callback_query);
    else if (update.message) await handleMessage(update.message);
  } catch (err: any) {
    console.error('handler error', err);
    const message =
      err instanceof OutOfTimeError
        ? '⏱ Не успел прочитать это фото — на нём слишком много текста.\n\nПопробуйте снять рецепт в две части: отдельно ингредиенты, отдельно приготовление. Второе фото добавьте кнопкой «📷 Добавить фото».'
        : `⚠️ Что-то пошло не так: ${esc(String(err?.message || err))}\n\nПопробуйте ещё раз.`;
    await say(chatId, message).catch(() => {});
  }

  // Always 200 — a non-200 makes Telegram retry the same update.
  return res.status(200).send('ok');
}
