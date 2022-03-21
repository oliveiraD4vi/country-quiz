import { useState } from 'react';
import { SelectedOptionProvider } from './contexts/SelectedOptionContext';

import Results from './components/results/results';
import QuestionRender from './components/questionRender/questionRender';

import TopIcon from './assets/undraw_adventure.svg';

import './styles/global.css';

export default function App() {
  const [scores, setScores] = useState(0);
  const [finalized, setFinalized] = useState(false);

  return (
    <SelectedOptionProvider>
      <div className="app">
        <main className="app-main">
          <div className="app-top">
            <p>country quiz</p>
            {!finalized 
              ? <img className="top-icon" src={TopIcon} alt="top-icon" />
              : null
            }
          </div>

          <div className="card-with-padding">
            <div className="content">
              {finalized
                ? <Results
                    scores={scores}
                    setScores={setScores}
                    setFinalized={setFinalized}
                  />
                : <QuestionRender 
                    setScores={setScores}
                    setFinalized={setFinalized}
                  />
                }
            </div>
          </div>
        </main>

        <footer className="app-footer">
          created by<a href="https://github.com/oliveiraD4vi" target="_blank" rel="noreferrer">
            &nbsp;oliveiraD4vi&nbsp;
          </a>- devChallenges.io
        </footer>
      </div>
    </SelectedOptionProvider>
  );
}
