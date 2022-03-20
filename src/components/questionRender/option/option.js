import { useContext } from 'react';
import { SelectedOptionContext } from '../../../contexts/SelectedOptionContext';

import './option.css';

const Option = ({ id, text, correct }) => {
  const { setSelectedOption } = useContext(SelectedOptionContext);

  const handleClick = () => {
    setSelectedOption({
      text: text,
      correct: correct,
    });
    if (correct) console.log(text, 'correct');
    else console.log(text, 'incorrect');
  }

  return (
    <button
      className="option-container"
      onClick={() => handleClick()}
    >
      <span>{id}</span>
      <p>{text}</p>
    </button>
  );
}

export default Option;
