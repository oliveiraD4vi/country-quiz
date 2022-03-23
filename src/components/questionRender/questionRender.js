import { useContext, useEffect, useState } from 'react';
import { SelectedOptionContext } from '../../contexts/SelectedOptionContext';

import Spin from '../spin/spin';
import Question from "./question/question";

const QuestionRender = ({ setFinalized, setScores, data, loading, setLoading }) => {
  const { selectedOption, setSelectedOption } = useContext(SelectedOptionContext);

  const [flag, setFlag] = useState(null);
  const [title, setTitle] = useState('');
  const [optionsList, setOptionsList] = useState(null);

  const getList = (data, type) => {
    const numbers = getNumbers(data.length);
    const n = Math.floor(Math.random() * 4);
    let list = [];
    for (var i = 0; i < 4; i++) {
      let item;
      switch (i) {
        case 0: item = 'A'; break;
        case 1: item = 'B'; break;
        case 2: item = 'C'; break;
        case 3: item = 'D'; break;
        default: break;
      }
      switch (type) {
        case 0:
        setFlag(null);
        if (i === n) {
          list.push({
            id: item,
            text: data[numbers[i]].name.common,
            correct: true,
          });
          if (!data[numbers[i]].capital)
            setTitle('Which one do NOT have a capital?');
          else {
            setTitle(
              `${data[numbers[i]].capital} is the capital of`
            );
          }
        } else {
          list.push({
            id: item,
            text: data[numbers[i]].name.common,
            correct: false,
          });
        }
        break;

        case 1:
        setTitle('Which country does this flag belong to?');
        if (i === n) {
          list.push({
            id: item,
            text: data[numbers[i]].name.common,
            correct: true,
          });
          setFlag(data[numbers[i]].flags.svg);
        } else {
          list.push({
            id: item,
            text: data[numbers[i]].name.common,
            correct: false,
          });
        }
        break;
        default: break;
      }
    }
    return list;
  }

  const getNumbers = (tam) => {
    let numbers = [];
    for (var i = 0; i < 4; i++) {
      let exists = false;
      const number = Math.floor(Math.random() * tam);
      numbers.forEach(element => {
        if (element === number) exists = true;
      });
      if (!exists) numbers.push(number);
    }
    return numbers;
  }

  const fetchData = async () => {
    setOptionsList(
      getList(data, Math.floor(Math.random() * 2))
    );
    setLoading(false);
  }

  useEffect(() => {
    if (data) {
      setLoading(true);
      fetchData();
    }
  }, [setFinalized, data]);

  const nextQuestion = () => {
    if (selectedOption.correct) {
      setScores((state) => (state+1));
      setLoading(true);
      setSelectedOption(null);
      fetchData();
    } else {
      setSelectedOption(null);
      setFinalized(true);
    }
  }

  return loading ? (
    <div className="loading-container">
      <Spin />
    </div>
  ) : (
    <div className="render-container">
      <Question
        img={flag}
        title={title}
        next={nextQuestion}
        options={optionsList}
        setFinalized={setFinalized}
        selectedOption={selectedOption}
      />
    </div>
  );
}

export default QuestionRender;
