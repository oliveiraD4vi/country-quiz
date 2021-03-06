import Option from '../Option/option';

import './question.css';

const Question = ({ img, title, options, next, selectedOption }) => {
  return (
    <div className="question-container">
      {img ? <img loading="eager" className="flag" src={img} alt="flag" /> : null}
      <h2>{title}</h2>
      <div className="options">
        {options && options.map((option) => (
          <Option
            id={option.id}
            key={option.id}
            text={option.text}
            correct={option.correct}
          />
        ))}
      </div>

      <div className="next-btn">
        {selectedOption && (
          <button onClick={next}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default Question;
