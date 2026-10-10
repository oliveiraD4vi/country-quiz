import { useEffect, useState } from "react";
import { setRoomInUrl } from "../App";
import { useApp } from "../context";
import type { ClientMessage, RoomView } from "../protocol";
import type { Settings } from "../quiz";
import { saveSettings } from "../session";
import { useCountdown, useRoom } from "../useRoom";
import { SettingsForm, TimeBar } from "./Common";
import { QuestionCard } from "./QuestionCard";

interface Props {
  name: string;
  initial: ClientMessage;
  onExit: () => void;
}

export function OnlineGame({ name, initial, onExit }: Props) {
  const { t } = useApp();
  const { room, status, error, receivedAt, send, leave } = useRoom({ name, initial, onLeft: onExit });
  // O código fica na URL: recarregar a página volta para a mesma sala.
  const code = room?.code;
  useEffect(() => {
    if (code) setRoomInUrl(code);
  }, [code]);

  if (error === "roomNotFound" && !room) {
    return (
      <article className="card center">
        <h2>{t.roomNotFound}</h2>
        <button type="button" className="btn btn-primary" onClick={onExit}>
          {t.back}
        </button>
      </article>
    );
  }

  if (!room) return <p className="status-line">{status === "reconnecting" ? t.reconnecting : t.connecting}</p>;

  return (
    <>
      {status === "reconnecting" && <p className="status-line warn">{t.reconnecting}</p>}
      {room.phase === "lobby" && <Lobby room={room} send={send} onLeave={leave} />}
      {(room.phase === "question" || room.phase === "reveal") && <Round room={room} receivedAt={receivedAt} send={send} />}
      {room.phase === "final" && <Final room={room} send={send} onLeave={leave} />}
    </>
  );
}

function Players({ room, show }: { room: RoomView; show: "presence" | "answered" | "score" }) {
  const { t } = useApp();
  const players = show === "score" ? [...room.players].sort((a, b) => b.score - a.score) : room.players;
  return (
    <ol className="players">
      {players.map((p, i) => (
        <li key={p.id} data-offline={!p.online}>
          {show === "score" && <span className="rank">{i + 1}</span>}
          <span className="player-name">
            {p.name}
            {p.id === room.you && <em> ({t.you})</em>}
            {p.id === room.host && <span className="tag">{t.host}</span>}
            {!p.online && <span className="tag tag-muted">{t.offline}</span>}
          </span>
          {show === "answered" && <span className="dot" data-on={p.answered} aria-label={p.answered ? "✓" : "…"} />}
          {show === "score" && <strong>{p.score}</strong>}
        </li>
      ))}
    </ol>
  );
}

function RoomCode({ code }: { code: string }) {
  const { t } = useApp();
  const [copied, setCopied] = useState(false);
  const link = `${location.origin}/?sala=${code}`;
  return (
    <div className="room-code">
      <div>
        <span className="label">{t.room}</span>
        <strong className="code">{code}</strong>
      </div>
      <p className="muted">{t.shareRoom}</p>
      <button
        type="button"
        className="btn"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            prompt(t.copyLink, link);
          }
        }}
      >
        {copied ? t.copied : t.copyLink}
      </button>
    </div>
  );
}

function Lobby({ room, send, onLeave }: { room: RoomView; send: (m: ClientMessage) => void; onLeave: () => void }) {
  const { t } = useApp();
  const isHost = room.you === room.host;
  const change = (settings: Settings) => {
    saveSettings(settings);
    send({ type: "settings", settings });
  };
  return (
    <div className="lobby">
      <article className="card">
        <RoomCode code={room.code} />
        <h3>{t.players}</h3>
        <Players room={room} show="presence" />
      </article>
      <article className="card">
        <SettingsForm value={room.settings} onChange={change} room readOnly={!isHost} />
        {!isHost && <p className="muted">{t.onlyHostSettings}</p>}
        <div className="actions">
          {isHost ? (
            <button type="button" className="btn btn-primary" onClick={() => send({ type: "start" })}>
              {t.startGame}
            </button>
          ) : (
            <p className="status-line">{t.waitingHost}</p>
          )}
          <button type="button" className="btn" onClick={onLeave}>
            {t.leave}
          </button>
        </div>
        {isHost && room.players.length < 2 && <p className="muted small">{t.needPlayers}</p>}
      </article>
    </div>
  );
}

function Round({ room, receivedAt, send }: { room: RoomView; receivedAt: number; send: (m: ClientMessage) => void }) {
  const { t } = useApp();
  const msLeft = useCountdown(room.msLeft, receivedAt, true);
  const me = room.players.find((p) => p.id === room.you);
  // A escolha fica guardada aqui até o servidor revelar; antes disso o servidor só diz que respondi.
  const [choice, setChoice] = useState<{ index: number; choice: number } | null>(null);
  const mine = room.reveal?.results.find((r) => r.id === room.you);
  const chosen = mine ? mine.choice : choice?.index === room.index ? choice.choice : null;
  const answeredCount = room.players.filter((p) => p.answered).length;
  const names = new Map(room.players.map((p) => [p.id, p.name]));

  if (!room.question) return null;

  return (
    <div className="round">
      <QuestionCard
        question={room.question}
        index={room.index}
        total={room.total}
        chosen={chosen}
        revealed={room.reveal?.question ?? null}
        onChoose={(c) => {
          if (me?.answered) return;
          setChoice({ index: room.index, choice: c });
          send({ type: "answer", index: room.index, choice: c });
        }}
        pickedBy={room.reveal ? (i) => room.reveal!.results.filter((r) => r.choice === i).map((r) => names.get(r.id) ?? "?") : undefined}
        top={
          <div className="question-meta">
            <TimeBar msLeft={msLeft} msTotal={room.msTotal} />
            <span className="score-now">{t.points(me?.score ?? 0)}</span>
          </div>
        }
        bottom={
          room.phase === "reveal" ? (
            <div className="after">
              <p className="verdict" data-good={(mine?.points ?? 0) > 0}>
                {mine?.choice === null || !mine ? t.timeUp : mine.points > 0 ? t.correct : t.wrong}
                {(mine?.points ?? 0) > 0 && <span> +{mine!.points}</span>}
              </p>
              <p className="muted">{t.nextIn(Math.ceil(msLeft / 1000))}</p>
            </div>
          ) : (
            <p className="muted center-text">{me?.answered ? t.waitingOthers : t.answered(answeredCount, room.players.filter((p) => p.online).length)}</p>
          )
        }
      />
      <aside className="card side">
        <h3>{t.ranking}</h3>
        <Players room={room} show={room.phase === "reveal" ? "score" : "answered"} />
      </aside>
    </div>
  );
}

function Final({ room, send, onLeave }: { room: RoomView; send: (m: ClientMessage) => void; onLeave: () => void }) {
  const { t } = useApp();
  const ranking = [...room.players].sort((a, b) => b.score - a.score);
  const podium = ranking.slice(0, 3);
  const isHost = room.you === room.host;
  return (
    <article className="card results">
      <p className="eyebrow">{t.final}</p>
      <ol className="podium">
        {podium.map((p, i) => (
          <li key={p.id} data-place={i + 1}>
            <span className="medal">{i + 1}</span>
            <strong>{p.name}</strong>
            <span>{t.points(p.score)}</span>
          </li>
        ))}
      </ol>
      {ranking.length > 3 && <Players room={room} show="score" />}
      <div className="actions">
        {isHost ? (
          <button type="button" className="btn btn-primary" onClick={() => send({ type: "again" })}>
            {t.playAgain}
          </button>
        ) : (
          <p className="status-line">{t.waitingHost}</p>
        )}
        <button type="button" className="btn" onClick={onLeave}>
          {t.leave}
        </button>
      </div>
    </article>
  );
}
