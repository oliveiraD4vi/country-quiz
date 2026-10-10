// Gerador de perguntas, compartilhado entre o navegador (modo solo) e o servidor (salas).
// As perguntas não têm texto: guardam só códigos (país, moeda, idioma…). Cada jogador vê o
// texto no próprio idioma (src/i18n.ts), então numa mesma sala dá para jogar em PT e em EN.

export type Lang = "pt" | "en";

export interface Country {
  code: string; // ISO 3166-1 alfa-2, minúsculo (nome do arquivo da bandeira)
  cca3: string;
  name: Record<Lang, string>;
  capital: Record<Lang, string> | null;
  region: string;
  subregion: string;
  area: number;
  borders: string[]; // cca3
  currencies: string[]; // ISO 4217
  languages: string[]; // ISO 639-3
  un: boolean;
}

export type Category = "capital" | "bandeira" | "continente" | "moeda" | "idioma" | "fronteira" | "area";
export type Difficulty = "facil" | "medio" | "dificil";

export const CATEGORIES: Category[] = ["capital", "bandeira", "continente", "moeda", "idioma", "fronteira", "area"];
export const DIFFICULTIES: Difficulty[] = ["facil", "medio", "dificil"];
export const REGIONS = ["Africa", "Americas", "Asia", "Europe", "Oceania"];

export interface Settings {
  categories: Category[];
  count: number;
  difficulty: Difficulty;
  /** Segundos por pergunta; 0 desliga o tempo (só no modo solo). */
  seconds: number;
}

export const DEFAULT_SETTINGS: Settings = { categories: ["capital", "bandeira", "continente"], count: 10, difficulty: "medio", seconds: 20 };
export const COUNTS = [10, 15, 20, 30];
export const SECONDS = [0, 10, 20, 30];

/** Referência a algo que o jogador vê como texto ou imagem. */
export type Ref =
  | { t: "country"; code: string }
  | { t: "capital"; code: string } // capital do país `code`
  | { t: "region"; code: string }
  | { t: "currency"; code: string }
  | { t: "language"; code: string };

export type Kind = "capitalOf" | "countryOfCapital" | "flag" | "region" | "currency" | "language" | "border" | "area";

export interface Question {
  category: Category;
  kind: Kind;
  /** País ou capital em destaque. */
  subject?: Ref;
  /** Código da bandeira a mostrar. */
  flag?: string;
  options: Ref[];
  answer: number;
  /** Dados para explicar a resposta: todos os vizinhos, moedas, idiomas… */
  facts?: Ref[];
  /** Na pergunta de tamanho, a área de cada alternativa (mesma ordem). */
  areas?: number[];
}

/** Pergunta sem a resposta, como vai para os jogadores numa sala. */
export type PublicQuestion = Omit<Question, "answer" | "facts" | "areas">;

export const toPublic = ({ answer: _a, facts: _f, areas: _r, ...q }: Question): PublicQuestion => q;

// ---------- Aleatoriedade ----------

export type Random = () => number;

/** Gerador com semente (mulberry32), para partidas reproduzíveis. */
export function seeded(seed: number): Random {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: T[], random: Random): T {
  return items[Math.floor(random() * items.length)];
}

function shuffle<T>(items: T[], random: Random): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Sorteia até `n` itens distintos (por `key`), ignorando as chaves em `exclude`. */
function sample<T>(items: T[], n: number, random: Random, key: (item: T) => string, exclude: Iterable<string> = []): T[] {
  const out: T[] = [];
  const seen = new Set(exclude);
  for (const item of shuffle(items, random)) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
    if (out.length === n) break;
  }
  return out;
}

function withOptions(correct: Ref, wrong: Ref[], random: Random): { options: Ref[]; answer: number } {
  const options = shuffle([correct, ...wrong], random);
  return { options, answer: options.indexOf(correct) };
}

const country = (c: Country): Ref => ({ t: "country", code: c.code });
const capital = (c: Country): Ref => ({ t: "capital", code: c.code });

// ---------- Perguntas ----------

function poolFor(countries: Country[], difficulty: Difficulty): Country[] {
  if (difficulty === "dificil") return countries;
  const un = countries.filter((c) => c.un);
  return difficulty === "facil" ? un.filter((c) => c.area >= 250_000) : un;
}

interface Context {
  all: Country[];
  pool: Country[];
  difficulty: Difficulty;
  random: Random;
  byCca3: Map<string, Country>;
}

/**
 * Alternativas erradas: no fácil e no médio vêm do mesmo grupo das perguntas (nada de territórios
 * obscuros); no médio e no difícil, de preferência da mesma região, o que confunde mais.
 */
function rivals({ all, pool, difficulty }: Context, target: Country): Country[] {
  const base = (difficulty === "dificil" ? all : pool).filter((c) => c.cca3 !== target.cca3);
  if (difficulty === "facil") return base;
  const near = base.filter((c) => c.region === target.region);
  return near.length >= 6 ? near : base;
}

type Builder = (target: Country, ctx: Context) => Question | null;

const builders: Record<Category, Builder> = {
  capital(target, ctx) {
    if (!target.capital) return null;
    const others = sample(rivals(ctx, target).filter((c) => c.capital), 3, ctx.random, (c) => c.capital!.en, [target.capital.en]);
    if (others.length < 3) return null;
    if (ctx.random() < 0.5) {
      return { category: "capital", kind: "capitalOf", subject: country(target), ...withOptions(capital(target), others.map(capital), ctx.random) };
    }
    return { category: "capital", kind: "countryOfCapital", subject: capital(target), ...withOptions(country(target), others.map(country), ctx.random) };
  },

  bandeira(target, ctx) {
    const others = sample(rivals(ctx, target), 3, ctx.random, (c) => c.code);
    if (others.length < 3) return null;
    return { category: "bandeira", kind: "flag", flag: target.code, ...withOptions(country(target), others.map(country), ctx.random) };
  },

  continente(target, { random }) {
    if (!REGIONS.includes(target.region)) return null;
    const wrong = shuffle(REGIONS.filter((r) => r !== target.region), random).slice(0, 3);
    return {
      category: "continente",
      kind: "region",
      subject: country(target),
      ...withOptions({ t: "region", code: target.region }, wrong.map((code) => ({ t: "region", code }) as Ref), random),
    };
  },

  moeda(target, { all, random }) {
    if (target.currencies.length === 0) return null;
    const others = sample(all.flatMap((c) => c.currencies), 3, random, (code) => code, target.currencies);
    if (others.length < 3) return null;
    return {
      category: "moeda",
      kind: "currency",
      subject: country(target),
      ...withOptions({ t: "currency", code: pick(target.currencies, random) }, others.map((code) => ({ t: "currency", code }) as Ref), random),
      facts: target.currencies.map((code) => ({ t: "currency", code })),
    };
  },

  idioma(target, { all, random }) {
    if (target.languages.length === 0) return null;
    const others = sample(all.flatMap((c) => c.languages), 3, random, (code) => code, target.languages);
    if (others.length < 3) return null;
    return {
      category: "idioma",
      kind: "language",
      subject: country(target),
      ...withOptions({ t: "language", code: pick(target.languages, random) }, others.map((code) => ({ t: "language", code }) as Ref), random),
      facts: target.languages.map((code) => ({ t: "language", code })),
    };
  },

  fronteira(target, ctx) {
    const neighbours = target.borders.flatMap((code) => ctx.byCca3.get(code) ?? []);
    if (neighbours.length === 0) return null;
    // Errados da mesma região, para não ser óbvio, e nunca um vizinho de verdade.
    const near = rivals({ ...ctx, difficulty: ctx.difficulty === "facil" ? "medio" : ctx.difficulty }, target);
    const others = sample(near, 3, ctx.random, (c) => c.code, [target.code, ...neighbours.map((c) => c.code)]);
    if (others.length < 3) return null;
    return {
      category: "fronteira",
      kind: "border",
      subject: country(target),
      ...withOptions(country(pick(neighbours, ctx.random)), others.map(country), ctx.random),
      facts: neighbours.map(country),
    };
  },

  area(target, { pool, random }) {
    // Quatro países com tamanhos bem diferentes entre si, para a pergunta ser justa.
    const group = [target];
    for (const c of shuffle(pool, random)) {
      if (group.length === 4) break;
      if (c.area > 0 && group.every((g) => Math.abs(g.area - c.area) / Math.max(g.area, c.area) > 0.15)) group.push(c);
    }
    if (group.length < 4) return null;
    const ordered = shuffle(group, random);
    const biggest = ordered.reduce((a, b) => (b.area > a.area ? b : a));
    return {
      category: "area",
      kind: "area",
      options: ordered.map(country),
      answer: ordered.indexOf(biggest),
      areas: ordered.map((c) => c.area),
    };
  },
};

/** Gera uma partida com perguntas variadas, sem repetir o país principal. */
export function generate(countries: Country[], settings: Settings, random: Random = Math.random): Question[] {
  const categories = settings.categories.length ? settings.categories : DEFAULT_SETTINGS.categories;
  const all = countries.filter((c) => c.region !== "Antarctic");
  const pool = shuffle(poolFor(all, settings.difficulty), random);
  const ctx: Context = { all, pool, difficulty: settings.difficulty, random, byCca3: new Map(countries.map((c) => [c.cca3, c])) };
  const questions: Question[] = [];
  const used = new Set<string>();
  let attempts = 0;
  while (questions.length < settings.count && attempts < settings.count * 20) {
    attempts++;
    const category = categories[questions.length % categories.length];
    const target = pool.find((c) => !used.has(c.cca3)) ?? pick(pool, random);
    used.add(target.cca3);
    const question = builders[category](target, ctx);
    if (question) questions.push(question);
  }
  return shuffle(questions, random);
}

/** Pontos de uma resposta certa: 100, mais até 50 pela rapidez quando há tempo. */
export function points(correct: boolean, msLeft: number, seconds: number): number {
  if (!correct) return 0;
  if (!seconds) return 100;
  return 100 + Math.round(50 * Math.max(0, Math.min(1, msLeft / (seconds * 1000))));
}

export function cleanSettings(value: Partial<Settings> | undefined): Settings {
  const categories = (value?.categories ?? []).filter((c): c is Category => CATEGORIES.includes(c));
  return {
    categories: categories.length ? categories : DEFAULT_SETTINGS.categories,
    count: COUNTS.includes(Number(value?.count)) ? Number(value?.count) : DEFAULT_SETTINGS.count,
    difficulty: DIFFICULTIES.includes(value?.difficulty as Difficulty) ? (value!.difficulty as Difficulty) : DEFAULT_SETTINGS.difficulty,
    seconds: SECONDS.includes(Number(value?.seconds)) ? Number(value?.seconds) : DEFAULT_SETTINGS.seconds,
  };
}
