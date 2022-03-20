import './option.css';

const Option = ({ id, text, correct }) => {
  const handleClick = () => {
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
