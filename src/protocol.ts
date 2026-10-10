// Mensagens trocadas pelo WebSocket entre o navegador e o servidor de salas.
import type { PublicQuestion, Question, Settings } from "./quiz.ts";

export type Phase = "lobby" | "question" | "reveal" | "final";

export interface PlayerView {
  id: string;
  name: string;
  online: boolean;
  score: number;
  /** Já respondeu a pergunta atual. */
  answered: boolean;
}

export interface RevealView {
  question: Question;
  results: { id: string; choice: number | null; points: number }[];
}

export interface RoomView {
  code: string;
  host: string;
  you: string;
  players: PlayerView[];
  settings: Settings;
  phase: Phase;
  index: number;
  total: number;
  question: PublicQuestion | null;
  /** Milissegundos restantes na pergunta ou até a próxima, no momento do envio. */
  msLeft: number;
  /** Duração total da fase atual, para a barra de tempo. */
  msTotal: number;
  reveal: RevealView | null;
}

export type ErrorCode = "roomNotFound" | "badSession" | "notReady";

export type ClientMessage =
  | { type: "hello"; session: string; name: string }
  | { type: "create"; settings: Settings }
  | { type: "join"; code: string }
  | { type: "settings"; settings: Settings }
  | { type: "start" }
  | { type: "answer"; index: number; choice: number }
  | { type: "again" }
  | { type: "leave" };

export type ServerMessage =
  | { type: "ready" }
  | { type: "room"; room: RoomView }
  | { type: "left" }
  | { type: "error"; code: ErrorCode };

export const CODE_LENGTH = 4;
/** Sem letras e números que se confundem (O/0, I/1). */
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const MAX_NAME = 20;
export const MAX_PLAYERS = 16;
/** Tempo mostrando a resposta antes da próxima pergunta. */
export const REVEAL_MS = 5000;

export const normalizeCode = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODE_LENGTH);
