import './init.css';

const Init = ({ setInitialized }) => {
  return (
    <div className="init-container">
      <h2>Hi, nice to met you</h2>
      <p>Click on the button below to start the quiz!</p>
      <button className="primary-button" onClick={() => setInitialized(true)}>
        Start
      </button>
    </div>
  );
}

export default Init;
