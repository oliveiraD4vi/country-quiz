import Option from '../option/option';

import './question.css';

const Question = ({ title, options }) => {
  return (
    <div className="question-container">
      <h2>{title}</h2>
      <div className="options">
        {options.map((option) => (
          <Option
            id={option.id}
            key={option.id}
            text={option.text}
          />
        ))}
      </div>
    </div>
  );
}

export default Question;
