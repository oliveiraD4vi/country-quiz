import { useApp } from "../context";
import { CATEGORY_TEXT, DIFFICULTY_TEXT, LANGS } from "../i18n";
import { CATEGORIES, COUNTS, DIFFICULTIES, SECONDS, type Category, type Settings } from "../quiz";

export function LangSwitch() {
  const { lang, setLang, t } = useApp();
  return (
    <div className="lang" role="group" aria-label={t.language}>
      {LANGS.map((l) => (
        <button key={l.id} type="button" aria-pressed={lang === l.id} onClick={() => setLang(l.id)} lang={l.locale}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

interface SettingsFormProps {
  value: Settings;
  onChange: (settings: Settings) => void;
  /** Nas salas o tempo é fixo e quem não é anfitrião só vê as regras. */
  room?: boolean;
  readOnly?: boolean;
}

export function SettingsForm({ value, onChange, room = false, readOnly = false }: SettingsFormProps) {
  const { lang, t } = useApp();
  const toggle = (category: Category) => {
    const has = value.categories.includes(category);
    const categories = has ? value.categories.filter((c) => c !== category) : [...value.categories, category];
    if (categories.length) onChange({ ...value, categories: CATEGORIES.filter((c) => categories.includes(c)) });
  };

  return (
    <fieldset className="settings" disabled={readOnly}>
      <div className="field">
        <legend className="label">{t.categories}</legend>
        <div className="topics">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" className="topic" aria-pressed={value.categories.includes(c)} onClick={() => toggle(c)}>
              <strong>{CATEGORY_TEXT[lang][c].label}</strong>
              <span>{CATEGORY_TEXT[lang][c].hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <span className="label">{t.questions}</span>
          <div className="segmented">
            {COUNTS.map((n) => (
              <button key={n} type="button" aria-pressed={value.count === n} onClick={() => onChange({ ...value, count: n })}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {!room && (
          <div className="field">
            <span className="label">{t.timer}</span>
            <div className="segmented">
              {SECONDS.map((n) => (
                <button key={n} type="button" aria-pressed={value.seconds === n} onClick={() => onChange({ ...value, seconds: n })}>
                  {n ? t.seconds(n) : t.noTimer}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="field">
        <span className="label">{t.difficulty}</span>
        <div className="segmented segmented-wide">
          {DIFFICULTIES.map((d) => (
            <button key={d} type="button" aria-pressed={value.difficulty === d} onClick={() => onChange({ ...value, difficulty: d })}>
              <strong>{DIFFICULTY_TEXT[lang][d].label}</strong>
              <span>{DIFFICULTY_TEXT[lang][d].hint}</span>
            </button>
          ))}
        </div>
      </div>
    </fieldset>
  );
}

/** Barra de tempo que esvazia. */
export function TimeBar({ msLeft, msTotal }: { msLeft: number; msTotal: number }) {
  const ratio = msTotal > 0 ? msLeft / msTotal : 0;
  return (
    <div className="timebar" role="timer" aria-label={`${Math.ceil(msLeft / 1000)} s`}>
      <span style={{ transform: `scaleX(${ratio})` }} data-low={ratio < 0.25} />
    </div>
  );
}
