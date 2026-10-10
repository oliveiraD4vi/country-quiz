import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientMessage, ErrorCode, RoomView, ServerMessage } from "./protocol";
import { sessionId } from "./session";

export type Status = "connecting" | "open" | "reconnecting";

interface Options {
  name: string;
  /** O que fazer quando a conexão abre pela primeira vez: criar ou entrar numa sala. */
  initial: ClientMessage;
  onLeft: () => void;
}

/** Conexão com o servidor de salas, com reconexão automática. O servidor devolve a sala ao reconectar. */
export function useRoom({ name, initial, onLeft }: Options) {
  const [room, setRoom] = useState<RoomView | null>(null);
  const [status, setStatus] = useState<Status>("connecting");
  const [error, setError] = useState<ErrorCode | null>(null);
  // Hora do servidor convertida para o relógio local, para os cronômetros.
  const [receivedAt, setReceivedAt] = useState(0);
  const socket = useRef<WebSocket | null>(null);
  const started = useRef(false);
  const code = useRef<string | null>(null);
  const leaving = useRef(false);
  const onLeftRef = useRef(onLeft);
  onLeftRef.current = onLeft;

  useEffect(() => {
    let attempt = 0;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let closed = false;

    function connect() {
      const url = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`;
      const ws = new WebSocket(url);
      socket.current = ws;
      ws.onopen = () => {
        attempt = 0;
        setStatus("open");
        ws.send(JSON.stringify({ type: "hello", session: sessionId(), name } satisfies ClientMessage));
      };
      ws.onmessage = (event) => {
        const message: ServerMessage = JSON.parse(event.data);
        if (message.type === "ready") {
          // Na primeira vez cria ou entra; ao reconectar, volta para a mesma sala pelo código
          // (o servidor também a devolve sozinho se ainda lembrar da sessão).
          if (!started.current) ws.send(JSON.stringify(initial));
          else if (code.current) ws.send(JSON.stringify({ type: "join", code: code.current } satisfies ClientMessage));
          started.current = true;
        } else if (message.type === "room") {
          code.current = message.room.code;
          setRoom(message.room);
          setReceivedAt(performance.now());
          setError(null);
        } else if (message.type === "error") {
          setError(message.code);
        } else if (message.type === "left") {
          onLeftRef.current();
        }
      };
      ws.onclose = () => {
        if (closed || leaving.current) return;
        setStatus("reconnecting");
        retry = setTimeout(connect, Math.min(8000, 500 * 2 ** attempt++));
      };
    }

    connect();
    return () => {
      closed = true;
      clearTimeout(retry);
      socket.current?.close();
    };
    // A conexão é aberta uma vez por montagem; nome e mensagem inicial valem para esse momento.
  }, []);

  const send = useCallback((message: ClientMessage) => {
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify(message));
  }, []);

  const leave = useCallback(() => {
    leaving.current = true;
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify({ type: "leave" } satisfies ClientMessage));
    else onLeftRef.current();
  }, []);

  return { room, status, error, receivedAt, send, leave };
}

/** Milissegundos restantes da fase atual, atualizados várias vezes por segundo. */
export function useCountdown(msLeft: number, receivedAt: number, active: boolean): number {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(performance.now()), 100);
    return () => clearInterval(id);
  }, [active]);
  return Math.max(0, msLeft - (now - receivedAt));
}
