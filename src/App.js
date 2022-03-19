import TopIcon from './assets/undraw_adventure.svg';

import './styles/global.css';

export default function App() {
  return (
    <div className="app">
      <main className="app-main">
        <p>country quiz</p>
        <div className="card-with-padding">
          <img src={TopIcon} alt="top-icon" />
        </div>
      </main>

      <footer className="app-footer">
        created by<p>&nbsp;oliveiraD4vi&nbsp;</p>- devChallenges.io
      </footer>
    </div>
  );
}
