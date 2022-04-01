<h1 align="center">{Country Quiz}</h1>

<div align="center">
   CountryQuiz is an interactive quiz developed as a solution for a challenge from  <a href="http://devchallenges.io" target="_blank">Devchallenges.io</a>.
</div>

<div align="center">
  <h3>
    <a href="https://{your-demo-link.your-domain}">
      Demo
    </a>
    <span> | </span>
    <a href="https://devchallenges.io/challenges/mM1UIenRhK808W8qmLWv">
      Challenge
    </a>
  </h3>
</div>

## Overview

![screenshot]('../../src/Assets/Overview.png')

### Built With

- [React](https://reactjs.org/)

## Features

This application/site was created as a submission to a [DevChallenges](https://devchallenges.io/challenges) challenge. The [challenge](https://devchallenges.io/challenges/mM1UIenRhK808W8qmLWv) was to build an application to complete the given user stories.

Running this project you will see an initial component that asks your name for mantaining records of your scores. You can click on the START button, iniciating the quiz, or in the button bellow, going to the records history.

Once you have iniciated the quiz, you can see at least two types of questions:
<ul>
  <li>Wich country does this flag belong to?</li>
  <li>[city name] is the capital of?</li>
</ul>

You will see four options, and you can select one of them.

Once you click on the option you think is the right one, the question will be blocked and the right option will have a green background. If you choose the right one, you click on the NEXT button and continue to play, but if not, the game will end and you will go to the results tab, that will show your score.

From that tab you can go back to home and start the game with another name or you can try again, what will erase your current score and reiniciate the count. You can also go to the records tab and see the previous records.

## API

The questions on this project were made with the <a href="https://restcountries.com/">REST Countries API</a>.

## How To Use

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) installed on your computer. After cloning the repository, use the package manager <a href="https://yarnpkg.com/" target="_blank" rel="noreferrer">yarn</a> to install the dependencies with the following comand line

```bash
yarn
```
With the project dependencies properly installed, run

```bash
yarn start
```
Doing that you will be sended to a page on your browser with the project running.

## License
[MIT](https://choosealicense.com/licenses/mit/)
