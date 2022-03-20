import './option.css';

const Option = ({ id, text }) => {
  return (
    <button className="option-container">
      <span>{id}</span>
      <p>{text}</p>
    </button>
  );
}

export default Option;
