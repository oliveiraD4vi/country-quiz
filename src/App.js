import { useState } from 'react';

import Results from './components/results/results';
import QuestionRender from './components/questionRender/questionRender';

import TopIcon from './assets/undraw_adventure.svg';

import './styles/global.css';

export default function App() {
  const [finalized, setFinalized] = useState(null);

  return (
    <div className="app">
      <main className="app-main">
        <div className="app-top">
          <p>country quiz</p>
          <img className="top-icon" src={TopIcon} alt="top-icon" />
        </div>

        <div className="card-with-padding">
          <div className="content">
            {finalized ? <Results scores={4} /> : <QuestionRender />}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        created by<a href="https://github.com/oliveiraD4vi" target="_blank" rel="noreferrer">
          &nbsp;oliveiraD4vi&nbsp;
        </a>- devChallenges.io
      </footer>
    </div>
  );
}
