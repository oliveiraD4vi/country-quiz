import type { ReactNode } from "react";
import { BY_CODE, useApp } from "../context";
import { CATEGORY_TEXT, explanation, promptText, refText } from "../i18n";
import type { PublicQuestion, Question } from "../quiz";

interface Props {
  question: PublicQuestion;
  index: number;
  total: number;
  /** Alternativa escolhida por este jogador. */
  chosen: number | null;
  /** Pergunta completa, quando a resposta já pode ser mostrada. */
  revealed: Question | null;
  onChoose: (choice: number) => void;
  /** Conteúdo acima das alternativas (barra de tempo) e abaixo (resultado, botões). */
  top?: ReactNode;
  bottom?: ReactNode;
  /** Quem escolheu cada alternativa, nas salas. */
  pickedBy?: (choice: number) => string[];
}

const LETTERS = ["A", "B", "C", "D"];

export function QuestionCard({ question: q, index, total, chosen, revealed, onChoose, top, bottom, pickedBy }: Props) {
  const { lang, t } = useApp();
  const locked = chosen !== null || revealed !== null;
  const subject = q.subject && refText(q.subject, lang, BY_CODE);

  return (
    <article className="card question">
      <header className="question-head">
        <span className="pill">{CATEGORY_TEXT[lang][q.category].label}</span>
        <span className="progress">{t.questionOf(index + 1, total)}</span>
      </header>
      {top}
      <h2 className="prompt">{promptText(q, lang)}</h2>
      {subject && <p className="subject">{subject}</p>}
      {q.flag && (
        <figure className="flag">
          <img src={`/flags/${q.flag}.png`} alt={t.title} width="320" height="213" />
        </figure>
      )}

      <ol className="options">
        {q.options.map((option, i) => {
          const state = revealed
            ? i === revealed.answer
              ? "right"
              : i === chosen
                ? "wrong"
                : "idle"
            : i === chosen
              ? "chosen"
              : "idle";
          const who = pickedBy?.(i) ?? [];
          return (
            <li key={i}>
              <button type="button" className="option" data-state={state} disabled={locked} onClick={() => onChoose(i)}>
                <span className="letter">{LETTERS[i]}</span>
                <span className="option-text">{refText(option, lang, BY_CODE)}</span>
                {who.length > 0 && <span className="who">{who.join(", ")}</span>}
              </button>
            </li>
          );
        })}
      </ol>

      {revealed && <p className="explanation">{explanation(revealed, lang, BY_CODE)}</p>}
      {bottom}
    </article>
  );
}
