import { useEffect } from 'react';
import { useState } from 'react';
import './records.css';

const Records = ({ setSeeRecords }) => {
  const [recordsList, setRecordsList] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("records"))
      setRecordsList(JSON.parse(localStorage.getItem("records")));
  }, [localStorage.getItem("records")]);
  
  return (
    <div className="records-container">
      <h2>Records</h2>
      <div className={`records ${
        !recordsList ? 'no-records' : null
      }`}>
        {recordsList
          ? recordsList.map((record) => (
            <div className="record">
              <p>{record.name}</p>
              <p>{record.scores}</p>
            </div>
          ))
          : <span>
              No records here yet <br />
              why don't you give it a try?
            </span>
          }
      </div>

      <button
        className="secondary-button"
        onClick={() => setSeeRecords(false)}
      >
        Go back home
      </button>
    </div>
  );
};

export default Records;
