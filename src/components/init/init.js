import './init.css';

const Init = ({ name, setName, setInitialized }) => {
  return (
    <div className="init-container">
      <h2>Hi, nice to met you</h2>
      <p>To start the quiz you have to share your name with us,<br />so we can remember your records!</p>

      <div className="name-input">
        <label>
          <p>Put your name here...</p>
          <input
            type="text"
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      </div>

      <button
        className="primary-button"
        disabled={name ? false : true}
        onClick={() => setInitialized(true)}
      >
        Start
      </button>
    </div>
  );
}

export default Init;
