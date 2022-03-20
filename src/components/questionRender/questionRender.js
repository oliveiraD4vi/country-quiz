import Question from "./question/question";

const QuestionRender = () => {
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
  ]

  return (
    <div className="render-container">
      <Question title={'Kuala Lumpur is the capital of'} options={optionsList} />
    </div>
  );
}

export default QuestionRender;
