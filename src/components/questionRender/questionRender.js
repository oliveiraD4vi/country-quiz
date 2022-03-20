import Question from "./question/question";

const QuestionRender = ({ setFinalized }) => {
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
    console.log('next question');
    setFinalized(true);
  }

  return (
    <div className="render-container">
      <Question
        next={nextQuestion}
        options={optionsList}
        title={'Kuala Lumpur is the capital of'}
        setFinalized={setFinalized}
      />
    </div>
  );
}

export default QuestionRender;
