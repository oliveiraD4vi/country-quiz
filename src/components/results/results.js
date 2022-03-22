import WinnerIcon from '../../assets/undraw_winners.svg';

import './results.css';

const Results = ({ scores, setScores, setFinalized, setInitialized }) => {
  const handleTryAgain = () => {
    setScores(0);
    setFinalized(false);
  };

  const handleHome = () => {
    setScores(0);
    setFinalized(false);
    setInitialized(false);
  };

  return (
    <div className="results-container">
      <img src={WinnerIcon} alt="top-icon" />

      <div className="results-txt">
        <h1>Results</h1>
        <p>
          You got <span>{scores}</span> correct answers
        </p>
      </div>

      <div className="btn-container">
        <button className="primary-button" onClick={() => handleTryAgain()}>
          Try again
        </button>
        <button className="secondary-button" onClick={() => handleHome()}>
          Home
        </button>
      </div>
    </div>
  );
}

export default Results;
