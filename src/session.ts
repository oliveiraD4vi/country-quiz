// Preferências do jogador guardadas no navegador. Tudo tem valor padrão se o armazenamento falhar.
import { DEFAULT_SETTINGS, cleanSettings, type Settings } from "./quiz";

function get(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function set(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* sem armazenamento local: segue sem salvar */
  }
}

/** Identificador desta pessoa nas salas; permite voltar ao mesmo lugar depois de recarregar. */
export function sessionId(): string {
  let id = get("quiz:session");
  if (!id) {
    id = crypto.randomUUID();
    set("quiz:session", id);
  }
  return id;
}

export const savedName = () => get("quiz:name") ?? "";
export const saveName = (name: string) => set("quiz:name", name);

export function savedSettings(): Settings {
  try {
    return cleanSettings(JSON.parse(get("quiz:settings") ?? "null") ?? DEFAULT_SETTINGS);
  } catch {
    return DEFAULT_SETTINGS;
  }
}
export const saveSettings = (settings: Settings) => set("quiz:settings", JSON.stringify(settings));

/** Recorde por combinação de regras (dificuldade e quantidade). */
const bestKey = (s: Settings) => `quiz:best:${s.difficulty}:${s.count}:${s.seconds ? "t" : "n"}`;
export const bestScore = (s: Settings) => Number(get(bestKey(s)) ?? 0);
export const saveBest = (s: Settings, score: number) => set(bestKey(s), String(score));

export const saveLang = (lang: string) => set("quiz:lang", lang);
