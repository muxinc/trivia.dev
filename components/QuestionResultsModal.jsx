import React from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import ResultsAnswerBar from './ResultsAnswerBar';

class QuestionResultsModal extends React.Component {
  constructor(props) {
    super(props);

    this.question = props.question;
    this.answers = props.answers;
    this.answerNumber = props.answerNumber;
    this.results = props.results;
    this.playerAnswer = props.playerAnswer;
    this.totalAnswers = this.results.reduce((a, b) => a + b);
  }

  componentDidMount() {}

  render() {
    return (
      <Modal>
        <p>Q: {this.question}</p>
        {this.results.map((result, i) => (
          <ResultsAnswerBar
            key={i}
            answer={this.answers[i]}
            correct={!!(i + 1 == this.answerNumber)}
            count={result}
            total={this.totalAnswers}
            isPlayers={this.playerAnswer == this.answerNumber}
          />
        ))}
      </Modal>
    );
  }
}

export default QuestionResultsModal;
