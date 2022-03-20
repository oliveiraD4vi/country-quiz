import Option from '../option/option';

import './question.css';

const Question = ({ title, options, next, selectedOption }) => {
  return (
    <div className="question-container">
      <h2>{title}</h2>
      <div className="options">
        {options.map((option) => (
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
