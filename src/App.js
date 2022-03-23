import { useState } from 'react';
import { SelectedOptionProvider } from './contexts/SelectedOptionContext';

import Init from './components/init/init';
import Results from './components/results/results';
import Records from './components/records/records';
import QuestionRender from './components/questionRender/questionRender';

import TopIcon from './assets/undraw_adventure.svg';

import './styles/global.css';

export default function App() {
  const [name, setName] = useState('');
  const [data, setData] = useState(null);
  const [scores, setScores] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finalized, setFinalized] = useState(false);
  const [seeRecords, setSeeRecords] = useState(false);
  const [initialized, setInitialized] = useState(false);

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
                    name={name}
                    scores={scores}
                    setName={setName}
                    setData={setData}
                    setScores={setScores}
                    setFinalized={setFinalized}
                    setSeeRecords={setSeeRecords}
                    setInitialized={setInitialized}
                  />
                : initialized
                ? <QuestionRender
                    setScores={setScores}
                    setFinalized={setFinalized}
                    data={data}
                    loading={loading}
                    setLoading={setLoading}
                  />
                : seeRecords
                ? <Records setSeeRecords={setSeeRecords} />
                : <Init
                    name={name}
                    setName={setName}
                    setSeeRecords={setSeeRecords}
                    setInitialized={setInitialized}
                    setLoading={setLoading}
                    setData={setData}
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
