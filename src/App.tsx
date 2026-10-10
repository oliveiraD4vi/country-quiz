import { useState } from "react";
import { LangSwitch, SettingsForm } from "./components/Common";
import { OnlineGame } from "./components/OnlineGame";
import { SoloGame } from "./components/SoloGame";
import { useApp } from "./context";
import type { ClientMessage } from "./protocol";
import { CODE_LENGTH, normalizeCode } from "./protocol";
import type { Settings } from "./quiz";
import { saveName, saveSettings, savedName, savedSettings } from "./session";

type Screen = { id: "home" } | { id: "solo"; settings: Settings } | { id: "online"; initial: ClientMessage };

/** Código de sala vindo do link compartilhado (?sala=ABCD). */
function codeFromUrl(): string {
  return normalizeCode(new URLSearchParams(location.search).get("sala") ?? "");
}

export function setRoomInUrl(code: string | null) {
  const url = code ? `${location.pathname}?sala=${code}` : location.pathname;
  history.replaceState(null, "", url);
}

export function App() {
  const { t } = useApp();
  const [name, setName] = useState(savedName);
  const [settings, setSettings] = useState(savedSettings);
  const [code, setCode] = useState(codeFromUrl);
  // Link de convite com nome já salvo: entra direto na sala.
  const [screen, setScreen] = useState<Screen>(() =>
    code.length === CODE_LENGTH && savedName() ? { id: "online", initial: { type: "join", code } } : { id: "home" },
  );

  const home = () => {
    setRoomInUrl(null);
    setScreen({ id: "home" });
  };
  const ensureName = () => {
    saveName(name.trim());
    return name.trim().length > 0;
  };

  return (
    <div className="page">
      <header className="top">
        <button type="button" className="brand" onClick={home}>
          <span className="globe" aria-hidden="true" />
          {t.title}
        </button>
        <LangSwitch />
      </header>

      <main className="main">
        {screen.id === "home" && (
          <div className="home">
            <section className="intro">
              <h1>{t.title}</h1>
              <p className="lead">{t.tagline}</p>
              <label className="name-field">
                <span className="label">{t.yourName}</span>
                <input
                  value={name}
                  maxLength={20}
                  placeholder={t.namePlaceholder}
                  autoComplete="nickname"
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            </section>

            <section className="card">
              <SettingsForm
                value={settings}
                onChange={(s) => {
                  setSettings(s);
                  saveSettings(s);
                }}
              />
              <div className="modes">
                <button
                  type="button"
                  className="mode mode-solo"
                  onClick={() => {
                    saveName(name.trim());
                    setScreen({ id: "solo", settings });
                  }}
                >
                  <strong>{t.solo}</strong>
                  <span>{t.soloHint}</span>
                </button>
                <button
                  type="button"
                  className="mode mode-room"
                  disabled={!name.trim()}
                  title={!name.trim() ? t.yourName : undefined}
                  onClick={() => ensureName() && setScreen({ id: "online", initial: { type: "create", settings } })}
                >
                  <strong>{t.createRoom}</strong>
                  <span>{t.createRoomHint}</span>
                </button>
              </div>
              <form
                className="join"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (code.length === CODE_LENGTH && ensureName()) setScreen({ id: "online", initial: { type: "join", code } });
                }}
              >
                <label>
                  <span className="label">{t.joinRoom}</span>
                  <input
                    value={code}
                    placeholder={t.roomCode}
                    maxLength={CODE_LENGTH}
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(e) => setCode(normalizeCode(e.target.value))}
                  />
                </label>
                <button type="submit" className="btn" disabled={code.length !== CODE_LENGTH || !name.trim()}>
                  {t.join}
                </button>
              </form>
              {!name.trim() && <p className="muted small">{t.yourName} ↑</p>}
            </section>
          </div>
        )}

        {screen.id === "solo" && <SoloGame settings={screen.settings} onExit={home} />}
        {screen.id === "online" && <OnlineGame name={name.trim()} initial={screen.initial} onExit={home} />}
      </main>

      <footer className="foot">
        <span>{t.footer}</span>
        <a href="https://coaladev.com.br" target="_blank" rel="noopener">
          Davi Oliveira
        </a>
      </footer>
    </div>
  );
}
