// Servidor do quiz de países: arquivos do site (dist/) e salas pelo WebSocket em /ws.
// Uso: PORT=4702 node server/index.ts  (Node 22.18+ executa TypeScript direto)
import { randomBytes, randomInt } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { WebSocketServer, type WebSocket } from "ws";
import { createStaticServer } from "./static.ts";
import { cleanSettings, generate, points, toPublic, type Country, type Question, type Settings } from "../src/quiz.ts";
import {
  CODE_ALPHABET,
  CODE_LENGTH,
  MAX_NAME,
  MAX_PLAYERS,
  REVEAL_MS,
  normalizeCode,
  type ClientMessage,
  type ErrorCode,
  type Phase,
  type RoomView,
  type ServerMessage,
} from "../src/protocol.ts";

const PORT = Number(process.env.PORT ?? 4702);
const HOST = process.env.HOST ?? "127.0.0.1";
const DIST = process.env.DIST ?? fileURLToPath(new URL("../dist", import.meta.url));
const ROOM_TTL = 30 * 60_000;
const SESSION_TTL = 2 * 60 * 60_000;
/** Nas salas sempre há tempo: sem ele, uma pessoa ausente travaria todo mundo. */
const ROOM_SECONDS = 20;

const countries: Country[] = JSON.parse(readFileSync(new URL("../src/data/countries.json", import.meta.url), "utf8"));

interface Session {
  id: string;
  /** Identificador público, o que os outros jogadores veem. */
  player: string;
  name: string;
  sockets: Set<WebSocket>;
  room: string | null;
  lastSeen: number;
}

interface Answer {
  choice: number;
  points: number;
}

interface Room {
  code: string;
  host: string; // id da sessão
  members: string[]; // ids de sessão, na ordem de entrada
  scores: Map<string, number>;
  settings: Settings;
  phase: Phase;
  questions: Question[];
  index: number;
  answers: Map<string, Answer>;
  phaseStarted: number;
  phaseEnds: number;
  timer: NodeJS.Timeout | null;
  lastActive: number;
}

const sessions = new Map<string, Session>();
const rooms = new Map<string, Room>();

const online = (id: string) => (sessions.get(id)?.sockets.size ?? 0) > 0;

function newCode(): string {
  for (;;) {
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    if (!rooms.has(code)) return code;
  }
}

// ---------- Visão da sala ----------

function view(room: Room, sessionId: string): RoomView {
  const now = Date.now();
  const question = room.questions[room.index];
  const settings = room.settings;
  return {
    code: room.code,
    host: sessions.get(room.host)?.player ?? "",
    you: sessions.get(sessionId)?.player ?? "",
    players: room.members.flatMap((id) => {
      const s = sessions.get(id);
      return s ? [{ id: s.player, name: s.name, online: online(id), score: room.scores.get(id) ?? 0, answered: room.answers.has(id) }] : [];
    }),
    settings,
    phase: room.phase,
    index: room.index,
    total: room.questions.length || settings.count,
    question: room.phase === "question" || room.phase === "reveal" ? toPublic(question) : null,
    msLeft: Math.max(0, room.phaseEnds - now),
    msTotal: Math.max(0, room.phaseEnds - room.phaseStarted),
    reveal:
      room.phase === "reveal"
        ? {
            question,
            results: room.members.flatMap((id) => {
              const s = sessions.get(id);
              const a = room.answers.get(id);
              return s ? [{ id: s.player, choice: a?.choice ?? null, points: a?.points ?? 0 }] : [];
            }),
          }
        : null,
  };
}

function broadcast(room: Room) {
  room.lastActive = Date.now();
  for (const id of room.members) {
    const s = sessions.get(id);
    if (s) sendTo(s, { type: "room", room: view(room, id) });
  }
}

// ---------- Fluxo da partida ----------

function setPhase(room: Room, phase: Phase, ms: number, next?: () => void) {
  if (room.timer) clearTimeout(room.timer);
  room.timer = null;
  room.phase = phase;
  room.phaseStarted = Date.now();
  room.phaseEnds = room.phaseStarted + ms;
  if (next) room.timer = setTimeout(next, ms);
  broadcast(room);
}

function askQuestion(room: Room) {
  room.answers.clear();
  setPhase(room, "question", ROOM_SECONDS * 1000, () => reveal(room));
}

function reveal(room: Room) {
  const last = room.index >= room.questions.length - 1;
  setPhase(room, "reveal", REVEAL_MS, () => {
    if (last) return setPhase(room, "final", 0);
    room.index++;
    askQuestion(room);
  });
}

function startGame(room: Room) {
  room.questions = generate(countries, room.settings);
  room.index = 0;
  room.scores = new Map(room.members.map((id) => [id, 0]));
  askQuestion(room);
}

function backToLobby(room: Room) {
  room.questions = [];
  room.index = 0;
  room.answers.clear();
  setPhase(room, "lobby", 0);
}

// ---------- Entrada e saída ----------

function leaveRoom(session: Session) {
  const room = session.room ? rooms.get(session.room) : undefined;
  session.room = null;
  if (!room) return;
  room.members = room.members.filter((id) => id !== session.id);
  room.answers.delete(session.id);
  if (room.members.length === 0) {
    if (room.timer) clearTimeout(room.timer);
    rooms.delete(room.code);
    return;
  }
  if (room.host === session.id) room.host = room.members.find(online) ?? room.members[0];
  maybeEndQuestion(room);
  broadcast(room);
}

function joinRoom(session: Session, room: Room) {
  if (session.room !== room.code) leaveRoom(session);
  session.room = room.code;
  if (!room.members.includes(session.id)) {
    room.members.push(session.id);
    if (!room.scores.has(session.id)) room.scores.set(session.id, 0);
  }
  broadcast(room);
}

/** Se todo mundo que está conectado já respondeu, revela sem esperar o tempo acabar. */
function maybeEndQuestion(room: Room) {
  if (room.phase !== "question") return;
  const waiting = room.members.filter((id) => online(id) && !room.answers.has(id));
  if (waiting.length === 0 && room.answers.size > 0) reveal(room);
}

// ---------- Mensagens ----------

function sendTo(session: Session, message: ServerMessage) {
  for (const socket of session.sockets) send(socket, message);
}

function send(socket: WebSocket, message: ServerMessage) {
  if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(message));
}

const fail = (socket: WebSocket, code: ErrorCode) => send(socket, { type: "error", code });

const cleanName = (value: unknown) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, MAX_NAME) || "?" : "?";

function handle(socket: WebSocket, state: { session: Session | null }, message: ClientMessage) {
  if (message.type === "hello") {
    if (typeof message.session !== "string" || !/^[A-Za-z0-9-]{8,64}$/.test(message.session)) return fail(socket, "badSession");
    const session = sessions.get(message.session) ?? {
      id: message.session,
      player: randomBytes(6).toString("hex"),
      name: "",
      sockets: new Set<WebSocket>(),
      room: null,
      lastSeen: Date.now(),
    };
    sessions.set(session.id, session);
    session.name = cleanName(message.name);
    session.sockets.add(socket);
    state.session = session;
    send(socket, { type: "ready" });
    const room = session.room ? rooms.get(session.room) : undefined;
    if (room) broadcast(room);
    return;
  }

  const session = state.session;
  if (!session) return fail(socket, "notReady");
  const room = session.room ? rooms.get(session.room) : undefined;
  const isHost = room?.host === session.id;

  switch (message.type) {
    case "create": {
      const created: Room = {
        code: newCode(),
        host: session.id,
        members: [],
        scores: new Map(),
        settings: { ...cleanSettings(message.settings), seconds: ROOM_SECONDS },
        phase: "lobby",
        questions: [],
        index: 0,
        answers: new Map(),
        phaseStarted: Date.now(),
        phaseEnds: Date.now(),
        timer: null,
        lastActive: Date.now(),
      };
      rooms.set(created.code, created);
      return joinRoom(session, created);
    }
    case "join": {
      const target = rooms.get(normalizeCode(String(message.code ?? "")));
      if (!target || (target.members.length >= MAX_PLAYERS && !target.members.includes(session.id))) return fail(socket, "roomNotFound");
      return joinRoom(session, target);
    }
    case "settings": {
      if (!room || !isHost || room.phase !== "lobby") return;
      room.settings = { ...cleanSettings(message.settings), seconds: ROOM_SECONDS };
      return broadcast(room);
    }
    case "start": {
      if (!room || !isHost || room.phase !== "lobby") return;
      return startGame(room);
    }
    case "answer": {
      if (!room || room.phase !== "question" || message.index !== room.index || room.answers.has(session.id)) return;
      const question = room.questions[room.index];
      const choice = Number(message.choice);
      if (!Number.isInteger(choice) || choice < 0 || choice >= question.options.length) return;
      const msLeft = room.phaseEnds - Date.now();
      room.answers.set(session.id, { choice, points: points(choice === question.answer, msLeft, ROOM_SECONDS) });
      room.scores.set(session.id, (room.scores.get(session.id) ?? 0) + room.answers.get(session.id)!.points);
      broadcast(room);
      return maybeEndQuestion(room);
    }
    case "again": {
      if (!room || !isHost || room.phase !== "final") return;
      return backToLobby(room);
    }
    case "leave": {
      leaveRoom(session);
      return send(socket, { type: "left" });
    }
  }
}

// ---------- Servidor ----------

const http = createStaticServer(DIST);
const wss = new WebSocketServer({ server: http, path: "/ws", maxPayload: 4096 });

wss.on("connection", (socket) => {
  const state: { session: Session | null } = { session: null };
  let alive = true;
  socket.on("pong", () => (alive = true));
  const heartbeat = setInterval(() => {
    if (!alive) return socket.terminate();
    alive = false;
    socket.ping();
  }, 30_000);

  socket.on("message", (data) => {
    let message: ClientMessage;
    try {
      message = JSON.parse(String(data));
    } catch {
      return;
    }
    if (message && typeof message === "object" && typeof message.type === "string") handle(socket, state, message);
  });

  socket.on("close", () => {
    clearInterval(heartbeat);
    const session = state.session;
    if (!session) return;
    session.sockets.delete(socket);
    session.lastSeen = Date.now();
    const room = session.room ? rooms.get(session.room) : undefined;
    if (!room) return;
    // Anfitrião caiu: passa para alguém conectado, para a sala não ficar presa.
    if (room.host === session.id && !online(session.id)) room.host = room.members.find(online) ?? room.host;
    maybeEndQuestion(room);
    broadcast(room);
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (!room.members.some(online) && now - room.lastActive > ROOM_TTL) {
      if (room.timer) clearTimeout(room.timer);
      rooms.delete(code);
    }
  }
  for (const [id, session] of sessions) {
    if (session.sockets.size === 0 && now - session.lastSeen > SESSION_TTL) {
      if (session.room) leaveRoom(session);
      sessions.delete(id);
    }
  }
}, 60_000).unref();

http.listen(PORT, HOST, () => console.log(`country-quiz: http://${HOST}:${PORT} (salas em /ws)`));
