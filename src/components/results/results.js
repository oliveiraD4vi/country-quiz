import WinnerIcon from '../../assets/undraw_winners.svg';

import './results.css';

const Results = ({
  name,
  setName,
  scores,
  setScores,
  setFinalized,
  setInitialized,
  setSeeRecords,
  setData,
}) => {
  const handleTryAgain = () => {
    setScores(0);
    setFinalized(false);
  };

  const handleHome = () => {
    localStorage.setItem(
      "records", JSON.stringify(fetchLocalStorage())
    );
    leave();
  };

  const handleRecords = () => {
    localStorage.setItem(
      "records", JSON.stringify(fetchLocalStorage())
    );
    leave();
    setSeeRecords(true);
  }

  const fetchLocalStorage = () => {
    let array = [];
    
    if (localStorage.getItem("records"))
      array = JSON.parse(localStorage.getItem("records"));
    array.push({
      name: name,
      scores: scores,
    });

    return array;
  }

  const leave = () => {
    setScores(0);
    setFinalized(false);
    setInitialized(false);
    setData(null);
    setName('');
  }

  return (
    <div className="results-container">
      <div className="results-txt name">
        <p>
          Hey, <span>{name}</span>! It was fun?
          <br />
          We hope so!
        </p>
      </div>

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

      <span className="records-link" onClick={() => handleRecords()}>
        You can also see the records here...
      </span>
    </div>
  );
}

export default Results;
