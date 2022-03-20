import { useContext } from 'react';
import { SelectedOptionContext } from '../../contexts/SelectedOptionContext';

import Question from "./question/question";

const QuestionRender = ({ setFinalized, setScores }) => {
  const { selectedOption } = useContext(SelectedOptionContext);

  const optionsList = [
    {
      id: 'A',
      text: 'Vietnam',
      correct: false,
    },
    {
      id: 'B',
      text: 'Malaysia',
      correct: true,
    },
    {
      id: 'C',
      text: 'Sweden',
      correct: false,
    },
    {
      id: 'D',
      text: 'Austria',
      correct: false,
    }
  ];

  const nextQuestion = () => {
    if (selectedOption.correct)
      setScores((state) => (state+1));
    else
      setFinalized(true);
  }

  return (
    <div className="render-container">
      <Question
        next={nextQuestion}
        options={optionsList}
        title={'Kuala Lumpur is the capital of'}
        setFinalized={setFinalized}
        selectedOption={selectedOption}
      />
    </div>
  );
}

export default QuestionRender;
