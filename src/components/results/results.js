import WinnerIcon from '../../assets/undraw_winners.svg';

import './results.css';

const Results = ({ scores }) => {
  const handleClick = () => {
    console.log('clicked');
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

      <button
        className="try-again-btn"
        onClick={() => handleClick()}
      >
        Try again
      </button>
    </div>
  );
}

export default Results;
