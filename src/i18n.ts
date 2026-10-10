// Textos da interface e das perguntas em português e inglês.
import type { Category, Country, Difficulty, Lang, Question, PublicQuestion, Ref } from "./quiz";

export const LANGS: { id: Lang; label: string; locale: string }[] = [
  { id: "pt", label: "PT", locale: "pt-BR" },
  { id: "en", label: "EN", locale: "en" },
];
export const localeOf = (lang: Lang) => (lang === "pt" ? "pt-BR" : "en");

const pt = {
  title: "Quiz de países",
  tagline: "Capitais, bandeiras, moedas, fronteiras e mais. Jogue sozinho ou desafie amigos numa sala.",
  yourName: "Seu nome",
  namePlaceholder: "Como você quer aparecer",
  solo: "Jogar sozinho",
  soloHint: "No seu ritmo, com o seu recorde",
  createRoom: "Criar sala",
  createRoomHint: "Chame amigos pelo link",
  withFriends: "Jogar com amigos",
  withFriendsHint: "Crie uma sala com as regras ao lado e mande o link, ou entre com um código.",
  needName: "Escreva seu nome para jogar online.",
  joinRoom: "Entrar numa sala",
  roomCode: "Código da sala",
  join: "Entrar",
  categories: "Assuntos",
  questions: "Perguntas",
  difficulty: "Dificuldade",
  timer: "Tempo por pergunta",
  noTimer: "Sem tempo",
  seconds: (n: number) => `${n} s`,
  start: "Começar",
  back: "Voltar",
  next: "Próxima",
  seeResults: "Ver resultado",
  result: "Resultado",
  playAgain: "Jogar de novo",
  newSettings: "Mudar as regras",
  questionOf: (i: number, n: number) => `Pergunta ${i} de ${n}`,
  correct: "Acertou!",
  wrong: "Errou",
  timeUp: "Acabou o tempo",
  answer: "Resposta",
  points: (n: number) => `${n} pts`,
  score: "Pontos",
  hits: "Acertos",
  best: "Seu recorde",
  newBest: "Novo recorde!",
  review: "Para revisar",
  allRight: "Você acertou todas. Impressionante.",
  byCategory: "Por assunto",
  // Salas
  room: "Sala",
  shareRoom: "Mande o link ou o código para os amigos",
  copyLink: "Copiar link",
  copied: "Link copiado!",
  players: "Jogadores",
  host: "anfitrião",
  you: "você",
  waitingHost: "Esperando o anfitrião começar…",
  onlyHostSettings: "Só o anfitrião muda as regras.",
  startGame: "Começar a partida",
  needPlayers: "Dá para começar sozinho, mas é mais divertido com alguém.",
  answered: (n: number, total: number) => `${n} de ${total} responderam`,
  waitingOthers: "Esperando os outros…",
  ranking: "Classificação",
  final: "Resultado final",
  leave: "Sair da sala",
  connecting: "Conectando…",
  reconnecting: "Conexão perdida. Tentando de novo…",
  offline: "fora",
  roomNotFound: "Sala não encontrada. Confira o código.",
  gameRunning: "A partida já começou. Você entra na próxima.",
  nextIn: (n: number) => `Próxima em ${n}…`,
  footer: "Dados: mledoze/countries (ODbL), Wikidata e flagcdn.",
  language: "Idioma",
};

const en: typeof pt = {
  title: "Country Quiz",
  tagline: "Capitals, flags, currencies, borders and more. Play alone or challenge friends in a room.",
  yourName: "Your name",
  namePlaceholder: "How others will see you",
  solo: "Play solo",
  soloHint: "At your own pace, with your best score",
  createRoom: "Create a room",
  createRoomHint: "Invite friends with a link",
  withFriends: "Play with friends",
  withFriendsHint: "Create a room with the rules on the side and share the link, or join with a code.",
  needName: "Type your name to play online.",
  joinRoom: "Join a room",
  roomCode: "Room code",
  join: "Join",
  categories: "Topics",
  questions: "Questions",
  difficulty: "Difficulty",
  timer: "Time per question",
  noTimer: "No timer",
  seconds: (n: number) => `${n} s`,
  start: "Start",
  back: "Back",
  next: "Next",
  seeResults: "See results",
  result: "Results",
  playAgain: "Play again",
  newSettings: "Change the rules",
  questionOf: (i: number, n: number) => `Question ${i} of ${n}`,
  correct: "Correct!",
  wrong: "Wrong",
  timeUp: "Time's up",
  answer: "Answer",
  points: (n: number) => `${n} pts`,
  score: "Score",
  hits: "Correct",
  best: "Your best",
  newBest: "New best score!",
  review: "To review",
  allRight: "You got every single one right. Impressive.",
  byCategory: "By topic",
  room: "Room",
  shareRoom: "Send the link or the code to your friends",
  copyLink: "Copy link",
  copied: "Link copied!",
  players: "Players",
  host: "host",
  you: "you",
  waitingHost: "Waiting for the host to start…",
  onlyHostSettings: "Only the host can change the rules.",
  startGame: "Start the game",
  needPlayers: "You can start alone, but it's more fun with someone.",
  answered: (n: number, total: number) => `${n} of ${total} answered`,
  waitingOthers: "Waiting for the others…",
  ranking: "Ranking",
  final: "Final results",
  leave: "Leave room",
  connecting: "Connecting…",
  reconnecting: "Connection lost. Retrying…",
  offline: "away",
  roomNotFound: "Room not found. Check the code.",
  gameRunning: "The game has already started. You'll join the next one.",
  nextIn: (n: number) => `Next in ${n}…`,
  footer: "Data: mledoze/countries (ODbL), Wikidata and flagcdn.",
  language: "Language",
};

export type Strings = typeof pt;
export const STRINGS: Record<Lang, Strings> = { pt, en };

export const CATEGORY_TEXT: Record<Lang, Record<Category, { label: string; hint: string }>> = {
  pt: {
    capital: { label: "Capitais", hint: "Capital de um país, e país de uma capital" },
    bandeira: { label: "Bandeiras", hint: "De quem é esta bandeira?" },
    continente: { label: "Continentes", hint: "Onde fica cada país" },
    moeda: { label: "Moedas", hint: "Real, euro, iene…" },
    idioma: { label: "Idiomas", hint: "O que se fala em cada lugar" },
    fronteira: { label: "Fronteiras", hint: "Quem é vizinho de quem" },
    area: { label: "Tamanho", hint: "Qual país é o maior?" },
  },
  en: {
    capital: { label: "Capitals", hint: "A country's capital, and a capital's country" },
    bandeira: { label: "Flags", hint: "Whose flag is this?" },
    continente: { label: "Continents", hint: "Where each country is" },
    moeda: { label: "Currencies", hint: "Real, euro, yen…" },
    idioma: { label: "Languages", hint: "What people speak where" },
    fronteira: { label: "Borders", hint: "Who neighbours whom" },
    area: { label: "Size", hint: "Which country is the largest?" },
  },
};

export const DIFFICULTY_TEXT: Record<Lang, Record<Difficulty, { label: string; hint: string }>> = {
  pt: {
    facil: { label: "Fácil", hint: "Países grandes e conhecidos" },
    medio: { label: "Médio", hint: "Todos os membros da ONU" },
    dificil: { label: "Difícil", hint: "Inclui territórios e ilhas" },
  },
  en: {
    facil: { label: "Easy", hint: "Large, well-known countries" },
    medio: { label: "Medium", hint: "Every UN member" },
    dificil: { label: "Hard", hint: "Territories and islands too" },
  },
};

const REGION_TEXT: Record<Lang, Record<string, string>> = {
  pt: { Africa: "África", Americas: "Américas", Asia: "Ásia", Europe: "Europa", Oceania: "Oceania" },
  en: { Africa: "Africa", Americas: "Americas", Asia: "Asia", Europe: "Europe", Oceania: "Oceania" },
};

const PROMPTS: Record<Lang, Record<Question["kind"], string>> = {
  pt: {
    capitalOf: "Qual é a capital deste país?",
    countryOfCapital: "Esta é a capital de qual país?",
    flag: "De qual país é esta bandeira?",
    region: "Em que continente fica este país?",
    currency: "Qual é a moeda deste país?",
    language: "Qual destes é um idioma oficial deste país?",
    border: "Qual destes países faz fronteira com este?",
    area: "Qual destes países tem a maior área?",
  },
  en: {
    capitalOf: "What is the capital of this country?",
    countryOfCapital: "This is the capital of which country?",
    flag: "Which country does this flag belong to?",
    region: "Which continent is this country in?",
    currency: "What is this country's currency?",
    language: "Which of these is an official language here?",
    border: "Which of these countries borders this one?",
    area: "Which of these countries is the largest?",
  },
};

const displayNames = new Map<string, Intl.DisplayNames>();
function display(lang: Lang, type: "language" | "currency"): Intl.DisplayNames {
  const key = `${lang}:${type}`;
  if (!displayNames.has(key)) displayNames.set(key, new Intl.DisplayNames(localeOf(lang), { type }));
  return displayNames.get(key)!;
}
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Texto de uma referência no idioma do jogador. */
export function refText(ref: Ref, lang: Lang, byCode: Map<string, Country>): string {
  switch (ref.t) {
    case "country":
      return byCode.get(ref.code)?.name[lang] ?? ref.code;
    case "capital":
      return byCode.get(ref.code)?.capital?.[lang] ?? "?";
    case "region":
      return REGION_TEXT[lang][ref.code] ?? ref.code;
    case "currency":
      return capitalize(display(lang, "currency").of(ref.code) ?? ref.code);
    case "language":
      return capitalize(display(lang, "language").of(ref.code) ?? ref.code);
  }
}

export const promptText = (q: PublicQuestion, lang: Lang) => PROMPTS[lang][q.kind];

const number = (lang: Lang) => new Intl.NumberFormat(localeOf(lang));
const list = (items: string[], lang: Lang) => new Intl.ListFormat(localeOf(lang), { type: "conjunction" }).format(items);

/** Frase curta com o contexto da resposta, mostrada depois que o jogador responde. */
export function explanation(q: Question, lang: Lang, byCode: Map<string, Country>): string {
  const text = (ref: Ref) => refText(ref, lang, byCode);
  const subject = q.subject?.t === "capital" ? byCode.get(q.subject.code)?.name[lang] : q.subject && text(q.subject);
  const right = text(q.options[q.answer]);
  const facts = q.facts?.map(text) ?? [];
  const en = lang === "en";
  switch (q.kind) {
    case "capitalOf":
    case "countryOfCapital": {
      const code = q.subject!.code;
      return en ? `${byCode.get(code)?.name.en}: capital ${byCode.get(code)?.capital?.en}.` : `${byCode.get(code)?.name.pt}: capital ${byCode.get(code)?.capital?.pt}.`;
    }
    case "flag":
      return en ? `Flag of ${right}.` : `Bandeira: ${right}.`;
    case "region":
      return `${subject}: ${right}.`;
    case "currency":
      return en ? `${subject} uses ${list(facts, lang)}.` : `${subject}: ${list(facts, lang)}.`;
    case "language":
      return en
        ? `${subject}: official ${facts.length > 1 ? "languages" : "language"} ${list(facts, lang)}.`
        : `${subject}: ${facts.length > 1 ? "idiomas oficiais" : "idioma oficial"} ${list(facts, lang)}.`;
    case "border":
      return en ? `${subject} borders ${list(facts, lang)}.` : `${subject}: vizinho de ${list(facts, lang)}.`;
    case "area":
      return q.options
        .map((o, i) => ({ name: text(o), area: q.areas?.[i] ?? 0 }))
        .sort((a, b) => b.area - a.area)
        .map((c) => `${c.name}: ${number(lang).format(c.area)} km²`)
        .join(" · ");
  }
}

/** Idioma inicial: ?lang= na URL, depois o salvo, depois o do navegador. */
export function initialLang(): Lang {
  const param = new URLSearchParams(location.search).get("lang");
  if (param === "pt" || param === "en") return param;
  try {
    const saved = localStorage.getItem("quiz:lang");
    if (saved === "pt" || saved === "en") return saved;
  } catch {
    /* sem armazenamento local */
  }
  return navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
}
