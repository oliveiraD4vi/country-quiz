import { useEffect, useMemo, useRef, useState } from "react";
import { BY_CODE, COUNTRIES, useApp } from "../context";
import { CATEGORY_TEXT, explanation, promptText, refText } from "../i18n";
import { generate, points, type Category, type Question, type Settings } from "../quiz";
import { bestScore, saveBest } from "../session";
import { TimeBar } from "./Common";
import { QuestionCard } from "./QuestionCard";

interface Props {
  settings: Settings;
  onExit: () => void;
}

interface Answer {
  choice: number | null;
  points: number;
}

export function SoloGame({ settings, onExit }: Props) {
  const [round, setRound] = useState(0);
  const questions = useMemo(() => generate(COUNTRIES, settings), [settings, round]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [finished, setFinished] = useState(false);

  const restart = () => {
    setRound((r) => r + 1);
    setIndex(0);
    setAnswers([]);
    setFinished(false);
  };

  if (finished) return <Results questions={questions} answers={answers} settings={settings} onAgain={restart} onExit={onExit} />;

  return (
    <SoloQuestion
      key={`${round}-${index}`}
      question={questions[index]}
      index={index}
      total={questions.length}
      seconds={settings.seconds}
      last={index === questions.length - 1}
      score={answers.reduce((sum, a) => sum + a.points, 0)}
      onAnswer={(answer) => setAnswers((a) => [...a, answer])}
      onNext={() => (index === questions.length - 1 ? setFinished(true) : setIndex(index + 1))}
    />
  );
}

interface QuestionProps {
  question: Question;
  index: number;
  total: number;
  seconds: number;
  last: boolean;
  score: number;
  onAnswer: (answer: Answer) => void;
  onNext: () => void;
}

function SoloQuestion({ question, index, total, seconds, last, score, onAnswer, onNext }: QuestionProps) {
  const { t } = useApp();
  const [chosen, setChosen] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [msLeft, setMsLeft] = useState(seconds * 1000);
  const [gained, setGained] = useState(0);
  const started = useRef(performance.now());
  const next = useRef<HTMLButtonElement>(null);

  // Cronômetro: ao zerar, conta como resposta em branco.
  useEffect(() => {
    if (!seconds || done) return;
    const id = setInterval(() => {
      const left = Math.max(0, seconds * 1000 - (performance.now() - started.current));
      setMsLeft(left);
      if (left === 0) finish(null);
    }, 100);
    return () => clearInterval(id);
  });

  useEffect(() => {
    if (done) next.current?.focus();
  }, [done]);

  function finish(choice: number | null) {
    if (done) return;
    const left = seconds ? Math.max(0, seconds * 1000 - (performance.now() - started.current)) : 0;
    const earned = choice === null ? 0 : points(choice === question.answer, left, seconds);
    setChosen(choice);
    setGained(earned);
    setDone(true);
    onAnswer({ choice, points: earned });
  }

  const verdict = !done ? null : chosen === null ? t.timeUp : chosen === question.answer ? t.correct : t.wrong;

  return (
    <QuestionCard
      question={question}
      index={index}
      total={total}
      chosen={chosen}
      revealed={done ? question : null}
      onChoose={finish}
      top={
        <div className="question-meta">
          {seconds > 0 && <TimeBar msLeft={done ? 0 : msLeft} msTotal={seconds * 1000} />}
          <span className="score-now">{t.points(score)}</span>
        </div>
      }
      bottom={
        done && (
          <div className="after">
            <p className="verdict" data-good={chosen === question.answer}>
              {verdict}
              {gained > 0 && <span> +{gained}</span>}
            </p>
            <button ref={next} type="button" className="btn btn-primary" onClick={onNext}>
              {last ? t.seeResults : t.next}
            </button>
          </div>
        )
      }
    />
  );
}

interface ResultsProps {
  questions: Question[];
  answers: Answer[];
  settings: Settings;
  onAgain: () => void;
  onExit: () => void;
}

function Results({ questions, answers, settings, onAgain, onExit }: ResultsProps) {
  const { lang, t } = useApp();
  const score = answers.reduce((sum, a) => sum + a.points, 0);
  const hits = answers.filter((a, i) => a.choice === questions[i].answer).length;
  // O recorde anterior é lido uma vez, antes de salvar o novo.
  const [previousBest] = useState(() => bestScore(settings));
  const isBest = score > previousBest;
  useEffect(() => {
    if (isBest) saveBest(settings, score);
  }, [isBest, settings, score]);

  const byCategory = new Map<Category, { hits: number; total: number }>();
  questions.forEach((q, i) => {
    const entry = byCategory.get(q.category) ?? { hits: 0, total: 0 };
    entry.total++;
    if (answers[i]?.choice === q.answer) entry.hits++;
    byCategory.set(q.category, entry);
  });
  const misses = questions.flatMap((q, i) => (answers[i]?.choice === q.answer ? [] : [{ q, choice: answers[i]?.choice ?? null }]));

  return (
    <article className="card results">
      <p className="eyebrow">{t.result}</p>
      <div className="big-score">
        <strong>{score}</strong>
        <span>{t.score}</span>
      </div>
      <dl className="stats">
        <div>
          <dt>{t.hits}</dt>
          <dd>
            {hits}/{questions.length}
          </dd>
        </div>
        <div>
          <dt>{t.best}</dt>
          <dd>{Math.max(score, previousBest)}</dd>
        </div>
      </dl>
      {isBest && previousBest > 0 && <p className="badge">{t.newBest}</p>}

      <h3>{t.byCategory}</h3>
      <ul className="bars">
        {[...byCategory].map(([category, { hits, total }]) => (
          <li key={category}>
            <span>{CATEGORY_TEXT[lang][category].label}</span>
            <span className="bar">
              <span style={{ width: `${(hits / total) * 100}%` }} />
            </span>
            <span>
              {hits}/{total}
            </span>
          </li>
        ))}
      </ul>

      <h3>{t.review}</h3>
      {misses.length === 0 ? (
        <p className="muted">{t.allRight}</p>
      ) : (
        <ol className="review">
          {misses.map(({ q, choice }, i) => (
            <li key={i}>
              <p className="review-q">
                {promptText(q, lang)} {q.subject && <strong>{refText(q.subject, lang, BY_CODE)}</strong>}
                {q.flag && <img src={`/flags/${q.flag}.png`} alt="" width="48" height="32" />}
              </p>
              <p className="review-a">
                {choice !== null && <s>{refText(q.options[choice], lang, BY_CODE)}</s>} <strong>{refText(q.options[q.answer], lang, BY_CODE)}</strong>
              </p>
              <p className="muted">{explanation(q, lang, BY_CODE)}</p>
            </li>
          ))}
        </ol>
      )}

      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={onAgain}>
          {t.playAgain}
        </button>
        <button type="button" className="btn" onClick={onExit}>
          {t.newSettings}
        </button>
      </div>
    </article>
  );
}
