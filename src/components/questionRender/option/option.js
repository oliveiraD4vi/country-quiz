import { useContext } from 'react';
import { SelectedOptionContext } from '../../../contexts/SelectedOptionContext';

import './option.css';

const Option = ({ id, text, correct }) => {
  const { selectedOption, setSelectedOption } = useContext(SelectedOptionContext);

  const handleClick = () => {
    setSelectedOption({
      text: text,
      correct: correct,
    });
  }

  return (
    <button
      disabled={selectedOption ? true : false}
      className={
        `option-container ${selectedOption
          ? selectedOption.text === text && !correct
          ? 'selected-red'
          : correct
          ? 'selected-green'
          : 'non-selected'
          : null
        }`
      }
      onClick={() => handleClick()}
    >
      <span>{id}</span>
      <p>{text}</p>
    </button>
  );
}

export default Option;
