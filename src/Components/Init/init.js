import axios from 'axios';

import './init.css';

const Init = ({ name, setName, setInitialized, setSeeRecords, setData, setLoading }) => {
  const render = async () => {
    setInitialized(true);
    try {
      const response = await axios.get(
        'https://restcountries.com/v3.1/all?fields=name,capital,flags'
      );
      setData(response.data);
      setLoading(false);
    } catch (responseError) {
      render();
    }
  }

  return (
    <div className="init-container">
      <h2>Hi, nice to met you</h2>
      <p>To start the quiz you have to share your name with us, so we can remember your records!</p>

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
        onClick={() => render()}
      >
        Start
      </button>
      <button
        className="secondary-button"
        onClick={() => setSeeRecords(true)}
      >
        See records
      </button>
    </div>
  );
}

export default Init;
