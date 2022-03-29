import { useContext } from 'react';
import { SelectedOptionContext } from '../../../Contexts/SelectedOptionContext';

import DoneIcon from '../../../assets/icons/check-icon.svg';
import CloseIcon from '../../../assets/icons/close-icon.svg';

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
      <div>
        <span>{id}</span>
        <p>{text}</p>
      </div>

      {selectedOption && selectedOption.text === text && !correct
        ? <img src={CloseIcon} alt="icon" />
        : correct
        ? <img src={DoneIcon} alt="icon" />
        : null
      }
    </button>
  );
}

export default Option;
